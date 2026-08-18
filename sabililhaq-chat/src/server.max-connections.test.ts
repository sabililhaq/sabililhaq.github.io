import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type WebSocket from 'ws';
import {
  waitForServerReady,
  connectClient,
  expectConnectionRejected,
  waitFor,
} from './wsTestHelpers.js';

const TEST_PORT = 18086;
const HTTP_URL = `http://127.0.0.1:${TEST_PORT}`;
const WS_URL = `ws://127.0.0.1:${TEST_PORT}`;
const ALLOWED_ORIGIN = 'http://localhost:4321';

// Lower maxConnections to 1 so we can exercise the connection-limit branch
// deterministically without opening hundreds of real sockets.
vi.mock('./config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./config.js')>();
  return {
    ...actual,
    CONFIG: { ...actual.CONFIG, maxConnections: 1 },
  };
});

const openClients: WebSocket[] = [];
function track(ws: WebSocket): WebSocket {
  openClients.push(ws);
  return ws;
}

describe('chat server maxConnections enforcement', () => {
  beforeAll(async () => {
    process.env.PORT = String(TEST_PORT);
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOW_LOCALHOST;

    await import('./server.js');
    await waitForServerReady(`${HTTP_URL}/config`);
  }, 15000);

  afterAll(() => {
    for (const ws of openClients) {
      try {
        ws.terminate();
      } catch {
        // ignore
      }
    }
  });

  it('accepts a connection while under the limit, then rejects the next one', async () => {
    const { ws: first, messages: firstMessagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(first);
    const firstMessages = firstMessagesRaw as any[];
    await waitFor(() => firstMessages.some((m) => m.type === 'welcome'));

    await expectConnectionRejected(WS_URL, ALLOWED_ORIGIN);
  }, 10000);

  it('frees up capacity once a connection closes', async () => {
    // At this point the previous test's connection is still open and is
    // holding the single connection slot.
    await expectConnectionRejected(WS_URL, ALLOWED_ORIGIN);

    for (const ws of openClients.splice(0, openClients.length)) {
      ws.close();
    }
    // Give the server's `close` handler a moment to remove the client.
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { ws: second, messages: messagesRaw } = await connectClient(WS_URL, ALLOWED_ORIGIN);
    track(second);
    const messages = messagesRaw as any[];
    await waitFor(() => messages.some((m) => m.type === 'welcome'));

    expect(messages[0]).toMatchObject({ type: 'welcome' });
  }, 10000);
});
