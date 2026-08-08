import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

describe('sabililhaq-chat/package.json', () => {
  it('is an ESM package named sabililhaq-chat-service', () => {
    expect(pkg.name).toBe('sabililhaq-chat-service');
    expect(pkg.type).toBe('module');
    expect(pkg.private).toBe(true);
  });

  it('depends on ws for the WebSocket server', () => {
    expect(pkg.dependencies.ws).toBe('^8.18.0');
  });

  it('defines dev/build/start scripts consistent with the tsconfig outDir', () => {
    expect(pkg.scripts.dev).toBe('tsx watch src/server.ts');
    expect(pkg.scripts.build).toBe('tsc -p .');
    expect(pkg.scripts.start).toBe('node dist/server.js');
  });

  it('declares matching @types/node and @types/ws dev dependencies', () => {
    expect(pkg.devDependencies['@types/node']).toBeDefined();
    expect(pkg.devDependencies['@types/ws']).toBeDefined();
    expect(pkg.devDependencies.typescript).toBeDefined();
    expect(pkg.devDependencies.tsx).toBeDefined();
  });
});