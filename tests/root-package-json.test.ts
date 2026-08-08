import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

describe('root package.json', () => {
  it('depends on obscenity for the profanity filter', () => {
    expect(pkg.dependencies.obscenity).toBe('^0.4.6');
  });

  it('adds a dev:chat script that runs the chat service via tsx', () => {
    expect(pkg.scripts['dev:chat']).toBe('npx tsx watch sabililhaq-chat/src/server.ts');
  });

  it('adds a dev:all script that runs both the chat service and the astro site', () => {
    expect(pkg.scripts['dev:all']).toBe('npm run dev:chat & npm run dev');
    expect(pkg.scripts['dev:all']).toContain('dev:chat');
    expect(pkg.scripts['dev:all']).toContain('npm run dev');
  });

  it('keeps the pre-existing astro scripts intact', () => {
    expect(pkg.scripts.dev).toBe('astro dev');
    expect(pkg.scripts.build).toBe('astro build');
    expect(pkg.scripts.preview).toBe('astro preview');
  });
});