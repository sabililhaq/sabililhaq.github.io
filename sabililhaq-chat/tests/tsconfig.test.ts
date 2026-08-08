import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tsconfigPath = fileURLToPath(new URL('../tsconfig.json', import.meta.url));
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

describe('sabililhaq-chat/tsconfig.json', () => {
  it('targets NodeNext modules matching the ".js" import extensions used in src/', () => {
    expect(tsconfig.compilerOptions.module).toBe('NodeNext');
    expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
  });

  it('compiles src/ into dist/, matching the systemd service and npm start script', () => {
    expect(tsconfig.compilerOptions.rootDir).toBe('src');
    expect(tsconfig.compilerOptions.outDir).toBe('dist');
    expect(tsconfig.include).toEqual(['src']);
  });

  it('enables strict type checking', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});