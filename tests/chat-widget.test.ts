import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ChatWidget.astro embeds its client-side logic in an inline <script> tag
// rather than exporting it from a standalone module, so we can't unit-test
// its behavior directly. These tests instead guard the component's public
// contract (DOM hooks and key client-side constants) against regressions.
const widgetPath = fileURLToPath(
  new URL('../src/components/chat/ChatWidget.astro', import.meta.url),
);
const source = readFileSync(widgetPath, 'utf-8');

describe('src/components/chat/ChatWidget.astro', () => {
  it('exposes the DOM hooks the inline script depends on', () => {
    for (const id of [
      'nickname',
      'presence',
      'info-toggle',
      'info-panel',
      'expiration-seconds',
      'messages',
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

  it('truncates long rendered messages for display', () => {
    expect(source).toMatch(/MAX_MESSAGE_CHARS\s*=\s*40/);
  });

  it('mentions the info panel disclosures required by the spec', () => {
    const lower = source.toLowerCase();
    expect(lower).toContain('for fun only');
    expect(lower).toContain('websocket');
    expect(lower).toContain('for developers');
  });
});