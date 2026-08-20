import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

describe('root package.json', () => {
  it('depends on obscenity for the profanity filter', () => {
    expect(pkg.dependencies.obscenity).toBeDefined();
    expect(pkg.dependencies.obscenity).toMatch(/obscenity/);
  });

  it('runs the nested chat service from dev:chat', () => {
    expect(pkg.scripts['dev:chat']).toContain('sabililhaq-chat');
  });

  it('adds a dev:all script that runs both the chat service and the astro site', () => {
    expect(pkg.scripts['dev:all']).toContain('dev:chat');
    expect(pkg.scripts['dev:all']).toContain('npm run dev');
  });

  it('keeps the pre-existing astro scripts intact', () => {
    expect(pkg.scripts.dev).toBe('astro dev');
    expect(pkg.scripts.build).toBe('astro build');
    expect(pkg.scripts.preview).toBe('astro preview');
  });
});
