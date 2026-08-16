import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS } from '../src/consts';

const labsPagePath = fileURLToPath(new URL('../src/pages/labs.astro', import.meta.url));
const source = readFileSync(labsPagePath, 'utf-8');

describe('labs', () => {
  it('adds a Chat entry pointing at the new /chat route', () => {
    const chat = LABS.find((lab) => lab.label === 'Chat');

    expect(chat).toBeDefined();
    expect(chat!.url).toBe('/chat');
    expect(chat!.description).toMatch(/chat/i);
  });

  it('lists the Chat entry before the pre-existing Files entry', () => {
    const chatIndex = LABS.findIndex((lab) => lab.label === 'Chat');
    const filesIndex = LABS.findIndex((lab) => lab.label === 'Files');

    expect(chatIndex).toBeGreaterThan(-1);
    expect(filesIndex).toBeGreaterThan(-1);
    expect(chatIndex).toBeLessThan(filesIndex);
  });

  it('does not remove any of the pre-existing lab entries', () => {
    const labels = LABS.map((lab) => lab.label);
    for (const label of ['Files', 'Excalidraw', 'URL Shortener', 'QR Code Generator']) {
      expect(labels).toContain(label);
    }
  });

  it('uses a relative, non-external URL for the chat entry so it is not opened in a new tab', () => {
    const chat = LABS.find((lab) => lab.label === 'Chat');
    expect(chat!.url.startsWith('http')).toBe(false);
    expect(source).toContain("lab.url.startsWith('http')");
  });

  it('renders labs from the shared catalog', () => {
    expect(source).toContain('LABS');
    expect(source).toContain('lab.label');
    expect(source).toContain('lab.url');
  });
});
