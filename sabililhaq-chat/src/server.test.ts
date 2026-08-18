import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type WebSocket from 'ws';
import { CONFIG } from './config.js';
import {
  waitForServerReady,
  connectClient,
  expectConnectionRejected,
  waitFor,
} from './wsTestHelpers.js';

const TEST_PORT = 18085;
const HTTP_URL = `http://127.0.0.1:${TEST_PORT}`;
const WS_URL = `ws://127.0.0.1:${TEST_PORT}`;
const ALLOWED_ORIGIN = 'http://localhost:4321';

const openClients: WebSocket[] = [];
function track(ws: WebSocket): WebSocket {
  openClients.push(ws);
  return ws;
}

async function closeTrackedClients(): Promise<void> {
  const closing = openClients.splice(0, openClients.length);
  await Promise.all(
    closing.map(
      (ws) =>
        new Promise<void>((resolve) => {
          if (ws.readyState === ws.CLOSED) {
            resolve();
            return;
          }
          ws.once('close', () => resolve());
          try {
            ws.terminate();
          } catch {
            resolve();
          }
        }),
    ),
  );
  // Let the server finish its close handlers (presence broadcast, map delete).
  await new Promise((resolve) => setTimeout(resolve, 50));
}

describe('chat server (integration)', () => {
  beforeAll(async () => {
    process.env.PORT = String(TEST_PORT);
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOW_LOCALHOST;

    await import('./server.js');
    await waitForServerReady(`${HTTP_URL}/config`);
  }, 15000);

  afterEach(async () => {
    await closeTrackedClients();
  });

  afterAll(async () => {
    await closeTrackedClients();
  });

  it('GET /config returns the public configuration as JSON', async () => {
    const res = await fetch(`${HTTP_URL}/config`);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const body = await res.json();
    expect(body).toEqual({
      expirationSeconds: CONFIG.expirationSeconds,
      maxMessageLength: CONFIG.maxMessageLength,
    });
  });

  it('returns 404 for unknown HTTP paths', async () => {
    const res = await fetch(`${HTTP_URL}/does-not-exist`);
    expect(res.status).toBe(404);
  });

  it('rejects the WebSocket upgrade when the Origin header is not allowed', async () => {
    await expectConnectionRejected(WS_URL, 'https://evil.example.com');
  });

  it('rejects the WebSocket upgrade when there is no Origin header at all', async () => {
    await expectConnectionRejected(WS_URL);
  });

  it('accepts the WebSocket upgrade for an allowed Origin and sends welcome + backlog + presence', async () => {
    const { ws, messages } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const frames = messages as any[];

    await waitFor(() => frames.some((m) => m.type === 'presence'));

    expect(frames[0]).toMatchObject({ type: 'welcome' });
    expect(frames[0].nickname).toMatch(/^[a-z]+-[a-z]+$/);
    expect(frames[0].config).toEqual({
      expirationSeconds: CONFIG.expirationSeconds,
      maxMessageLength: CONFIG.maxMessageLength,
    });

    expect(frames[1]).toMatchObject({ type: 'backlog' });
    expect(Array.isArray(frames[1].messages)).toBe(true);

    expect(frames.find((m) => m.type === 'presence')).toEqual({
      type: 'presence',
      count: 1,
    });
  }, 10000);

  it('broadcasts presence with the live client count on connect and disconnect', async () => {
    const { ws: a, messages: aMsgsRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    const aMsgs = aMsgsRaw as any[];
    track(a);

    await waitFor(() => aMsgs.some((m) => m.type === 'presence' && m.count === 1));
    expect(aMsgs.find((m) => m.type === 'presence')).toEqual({
      type: 'presence',
      count: 1,
    });

    aMsgs.length = 0;

    const { ws: b, messages: bMsgsRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    const bMsgs = bMsgsRaw as any[];
    track(b);

    await waitFor(
      () =>
        aMsgs.some((m) => m.type === 'presence' && m.count === 2) &&
        bMsgs.some((m) => m.type === 'presence' && m.count === 2),
    );

    expect(aMsgs.filter((m) => m.type === 'presence').at(-1)).toEqual({
      type: 'presence',
      count: 2,
    });
    expect(bMsgs.find((m) => m.type === 'presence')).toEqual({
      type: 'presence',
      count: 2,
    });

    aMsgs.length = 0;
    b.close();

    await waitFor(() => aMsgs.some((m) => m.type === 'presence' && m.count === 1));
    expect(aMsgs.filter((m) => m.type === 'presence').at(-1)).toEqual({
      type: 'presence',
      count: 1,
    });
  }, 10000);

  it('broadcasts a chat message to every connected client, including the sender', async () => {
    const { ws: a, messages: aMsgsRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    const { ws: b, messages: bMsgsRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(a);
    track(b);
    const aMsgs = aMsgsRaw as any[];
    const bMsgs = bMsgsRaw as any[];

    await waitFor(() => aMsgs.some((m) => m.type === 'welcome') && bMsgs.some((m) => m.type === 'welcome'));
    aMsgs.length = 0;
    bMsgs.length = 0;

    a.send(JSON.stringify({ text: 'hello everyone' }));

    await waitFor(
      () => aMsgs.some((m) => m.type === 'message') && bMsgs.some((m) => m.type === 'message'),
    );

    const aMsg = aMsgs.find((m) => m.type === 'message');
    const bMsg = bMsgs.find((m) => m.type === 'message');

    expect(aMsg.message.text).toBe('hello everyone');
    expect(bMsg.message.text).toBe('hello everyone');
    expect(aMsg.message.id).toBe(bMsg.message.id);
    expect(typeof aMsg.message.nickname).toBe('string');
    expect(typeof aMsg.message.ts).toBe('number');
  }, 10000);

  it('rejects messages longer than maxMessageLength with an error', async () => {
    const { ws, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));
    messages.length = 0;

    ws.send(JSON.stringify({ text: 'a'.repeat(CONFIG.maxMessageLength + 1) }));

    await waitFor(() => messages.length >= 1);
    expect(messages[0]).toEqual({ type: 'error', reason: 'message_too_long' });
  }, 10000);

  it('accepts messages exactly at maxMessageLength', async () => {
    const { ws, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));
    messages.length = 0;

    const text = 'a'.repeat(CONFIG.maxMessageLength);
    ws.send(JSON.stringify({ text }));

    await waitFor(() => messages.length >= 1);
    expect(messages[0]).toMatchObject({ type: 'message' });
    expect(messages[0].message.text).toBe(text);
  }, 10000);

  it('responds with invalid_payload for malformed JSON', async () => {
    const { ws, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));
    messages.length = 0;

    ws.send('this is not valid json {{{');

    await waitFor(() => messages.length >= 1);
    expect(messages[0]).toEqual({ type: 'error', reason: 'invalid_payload' });
  }, 10000);

  it('silently ignores blank/whitespace-only messages without erroring or broadcasting', async () => {
    const { ws, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));
    messages.length = 0;

    ws.send(JSON.stringify({ text: '   ' }));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(messages).toHaveLength(0);

    // The connection should still be healthy afterwards.
    ws.send(JSON.stringify({ text: 'still alive' }));
    await waitFor(() => messages.length >= 1);
    expect(messages[0].message.text).toBe('still alive');
  }, 10000);

  it('rate limits a client that sends more messages than the token bucket burst allows', async () => {
    const { ws, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(ws);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));
    messages.length = 0;

    const attempts = CONFIG.rateLimit.burst + 1;
    for (let i = 0; i < attempts; i++) {
      ws.send(JSON.stringify({ text: `msg-${i}` }));
    }

    await waitFor(() => messages.length >= attempts);

    const rateLimitErrors = messages.filter((m) => m.type === 'error' && m.reason === 'rate_limited');
    const broadcasted = messages.filter((m) => m.type === 'message');

    expect(rateLimitErrors.length).toBeGreaterThanOrEqual(1);
    expect(broadcasted.length).toBeLessThanOrEqual(CONFIG.rateLimit.burst);
  }, 10000);
});
