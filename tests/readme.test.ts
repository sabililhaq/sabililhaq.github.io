import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readmePath = fileURLToPath(new URL('../README.md', import.meta.url));
const source = readFileSync(readmePath, 'utf-8');

describe('README.md', () => {
  it('documents the new chat feature', () => {
    expect(source).toMatch(/^# Chat$/m);
    expect(source).toContain('sabililhaq.com/chat');
  });

  it('documents the anonymous, account-less nature of the chat', () => {
    expect(source).toMatch(/No accounts \/ login/);
    expect(source.toLowerCase()).toContain('anonymous');
  });

  it('documents the random nickname scheme', () => {
    expect(source).toMatch(/adjective \+ animal/);
  });

  it('documents that the backend runs on ws.sabililhaq.com', () => {
    expect(source).toContain('ws.sabililhaq.com');
  });

  it('documents message expiration coming from backend configuration', () => {
    expect(source).toMatch(/messages disappear after/i);
    expect(source).toMatch(/backend configuration/i);
  });

  it('retains the original Astro starter kit documentation below the new section', () => {
    expect(source).toContain('# Astro Starter Kit: Blog');
    expect(source.indexOf('# Chat')).toBeLessThan(source.indexOf('# Astro Starter Kit: Blog'));
  });
});