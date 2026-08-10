import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const labsPagePath = fileURLToPath(new URL('../src/pages/labs.astro', import.meta.url));
const source = readFileSync(labsPagePath, 'utf-8');

describe('src/pages/labs.astro', () => {
  it('adds a Chat entry pointing at the new /chat route', () => {
    const chatEntryMatch = source.match(
      /label:\s*'Chat',\s*url:\s*'\/chat',\s*description:\s*'([^']*)'/,
    );

    expect(chatEntryMatch).not.toBeNull();
    expect(chatEntryMatch![1]).toMatch(/chat/i);
  });

  it('lists the Chat entry before the pre-existing Files entry', () => {
    const chatIndex = source.indexOf("label: 'Chat'");
    const filesIndex = source.indexOf("label: 'Files'");

    expect(chatIndex).toBeGreaterThan(-1);
    expect(filesIndex).toBeGreaterThan(-1);
    expect(chatIndex).toBeLessThan(filesIndex);
  });

  it('does not remove any of the pre-existing lab entries', () => {
    for (const label of ['Files', 'Excalidraw', 'URL Shortener', 'QR Code Generator']) {
      expect(source).toContain(`label: '${label}'`);
    }
  });

  it('uses a relative, non-external URL for the chat entry so it is not opened in a new tab', () => {
    // The template only sets target="_blank" for URLs starting with "http".
    expect(source).toContain("url: '/chat'");
  });
});