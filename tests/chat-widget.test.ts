import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Guard the widget DOM hooks and bundled client behavior.
const widgetPath = fileURLToPath(
  new URL('../src/components/chat/ChatWidget.astro', import.meta.url),
);
const widgetSource = readFileSync(widgetPath, 'utf-8');
const source = widgetSource + readFileSync(new URL('../src/components/chat/client.js', import.meta.url), 'utf-8');

describe('src/components/chat/ChatWidget.astro', () => {
  it('exposes the DOM hooks the client script depends on', () => {
    for (const id of [
      'nickname',
      'presence',
      'info-toggle',
      'info-panel',
      'expiration-seconds',
      'messages',
      'messages-empty',
      'composer',
      'message-input',
      'status',
    ]) {
      expect(source).toContain(`id="${id}"`);
    }
  });

  it('handles presence frames from the WebSocket server', () => {
    expect(source).toMatch(/case\s+['"]presence['"]/);
    expect(source).toMatch(/setPresence\(/);
    expect(source).toMatch(/1 online/);
  });

  it('bundles the client through Astro instead of serving raw TypeScript', () => {
    expect(widgetSource).toContain("<script>\n\timport './client.js';");
    expect(widgetSource).not.toContain('is:inline');
  });

  it('imports the shared profanity filter from filter.ts', () => {
    expect(source).toMatch(/import\s*\{\s*censorMessage\s*\}\s*from\s*'\.\/filter\.ts'/);
  });

  it('censors outgoing messages client-side before sending', () => {
    expect(source).toMatch(/censorMessage\(text\)/);
  });

  it('resolves the WebSocket backend to localhost:8080 in dev and wss://ws.sabililhaq.com otherwise', () => {
    expect(source).toContain("'ws://127.0.0.1:8080'");
    expect(source).toContain("'wss://ws.sabililhaq.com'");
  });

  it('enforces a client-side reconnect cap so it does not retry forever', () => {
    expect(source).toMatch(/maxReconnectAttempts\s*=\s*8/);
  });

  it('renders full message text with wrapping instead of truncating', () => {
    expect(source).not.toMatch(/MAX_MESSAGE_CHARS/);
    expect(source).toContain('white-space: normal');
    expect(source).toContain('id="messages-empty"');
  });

  it('mentions the info panel disclosures required by the spec', () => {
    const lower = source.toLowerCase();
    expect(lower).toContain('for fun only');
    expect(lower).toContain('websocket');
    expect(lower).toContain('for developers');
  });
});