import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const lockPath = fileURLToPath(new URL('../package-lock.json', import.meta.url));
const lock = JSON.parse(readFileSync(lockPath, 'utf-8'));

describe('root package-lock.json', () => {
  it('is valid JSON using lockfile version 3', () => {
    expect(lock.lockfileVersion).toBe(3);
  });

  it('declares obscenity as a root dependency matching package.json', () => {
    expect(lock.packages[''].dependencies.obscenity).toBe('^0.4.6');
  });

  it('pins a resolvable obscenity package entry with matching version and license', () => {
    const obscenityEntry = lock.packages['node_modules/obscenity'];

    expect(obscenityEntry).toBeDefined();
    expect(obscenityEntry.version).toBe('0.4.6');
    expect(obscenityEntry.license).toBe('MIT');
    expect(obscenityEntry.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/obscenity\//);
    expect(obscenityEntry.integrity).toMatch(/^sha512-/);
  });
});