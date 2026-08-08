import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const lockPath = fileURLToPath(new URL('../package-lock.json', import.meta.url));
const lock = JSON.parse(readFileSync(lockPath, 'utf-8'));

describe('sabililhaq-chat/package-lock.json', () => {
  it('is valid JSON using lockfile version 3 for the chat service package', () => {
    expect(lock.lockfileVersion).toBe(3);
    expect(lock.name).toBe('sabililhaq-chat-service');
  });

  it('declares the same runtime dependency (ws) as package.json', () => {
    expect(lock.packages[''].dependencies.ws).toBe('^8.18.0');
  });

  it('pins a resolvable ws package entry', () => {
    const wsEntry = lock.packages['node_modules/ws'];

    expect(wsEntry).toBeDefined();
    expect(wsEntry.version).toBe('8.21.3');
    expect(wsEntry.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/ws\//);
  });

  it('pins resolvable tsx and typescript dev dependency entries', () => {
    expect(lock.packages['node_modules/tsx']).toBeDefined();
    expect(lock.packages['node_modules/typescript']).toBeDefined();
    expect(lock.packages['node_modules/tsx'].dev).toBe(true);
    expect(lock.packages['node_modules/typescript'].dev).toBe(true);
  });
});