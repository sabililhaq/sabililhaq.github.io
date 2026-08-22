import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const lockPath = fileURLToPath(new URL('../package-lock.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const lock = JSON.parse(readFileSync(lockPath, 'utf-8'));

describe('root package-lock.json', () => {
  it('is valid JSON using lockfile version 3', () => {
    expect(lock.lockfileVersion).toBe(3);
  });

  it('declares obscenity as a root dependency matching package.json', () => {
    expect(lock.packages[''].dependencies.obscenity).toBe(pkg.dependencies.obscenity);
  });

  it('pins the GitHub obscenity fork', () => {
    const obscenityEntry = lock.packages['node_modules/obscenity'];

    expect(obscenityEntry).toBeDefined();
    expect(obscenityEntry.license).toBe('MIT');
    expect(obscenityEntry.resolved).toMatch(/github\.com\/sabililhaq\/obscenity/);
  });
});
