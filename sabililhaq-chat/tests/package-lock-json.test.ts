import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const lockPath = fileURLToPath(new URL('../package-lock.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const lock = JSON.parse(readFileSync(lockPath, 'utf-8'));

describe('sabililhaq-chat/package-lock.json', () => {
  it('is valid JSON using lockfile version 3 for the chat service package', () => {
    expect(lock.lockfileVersion).toBe(3);
    expect(lock.name).toBe('sabililhaq-chat-service');
  });

  it('stays in sync with package.json so npm ci can install', () => {
    expect(lock.packages[''].dependencies).toEqual(pkg.dependencies);
    expect(lock.packages[''].devDependencies).toEqual(pkg.devDependencies);
  });

  it('pins a resolvable ws package entry', () => {
    const wsEntry = lock.packages['node_modules/ws'];

    expect(wsEntry).toBeDefined();
    expect(wsEntry.version).toBe('8.21.3');
    expect(wsEntry.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/ws\//);
  });

  it('pins resolvable tsx, typescript, and vitest dev dependency entries', () => {
    expect(lock.packages['node_modules/tsx']).toBeDefined();
    expect(lock.packages['node_modules/typescript']).toBeDefined();
    expect(lock.packages['node_modules/vitest']).toBeDefined();
    expect(lock.packages['node_modules/tsx'].dev).toBe(true);
    expect(lock.packages['node_modules/typescript'].dev).toBe(true);
    expect(lock.packages['node_modules/vitest'].dev).toBe(true);
  });
});