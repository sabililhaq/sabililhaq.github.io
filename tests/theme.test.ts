import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const headerPath = fileURLToPath(new URL('../src/components/Header.astro', import.meta.url));
const headPath = fileURLToPath(new URL('../src/components/BaseHead.astro', import.meta.url));
const cssPath = fileURLToPath(new URL('../src/styles/global.css', import.meta.url));

describe('theme toggle', () => {
  it('puts a dark/light icon trigger on the right of the header', () => {
    const source = readFileSync(headerPath, 'utf-8');
    expect(source).toContain('id="theme-toggle"');
    expect(source).toContain('icon-moon');
    expect(source).toContain('icon-sun');
    expect(source).toContain("localStorage.setItem(STORAGE_KEY, theme)");
  });

  it('applies the stored theme before paint', () => {
    const source = readFileSync(headPath, 'utf-8');
    expect(source).toContain('is:inline');
    expect(source).toContain("localStorage.getItem('theme')");
    expect(source).toContain('dataset.theme');
  });

  it('defines a dark theme token set', () => {
    const source = readFileSync(cssPath, 'utf-8');
    expect(source).toContain("html[data-theme='dark']");
    expect(source).toContain('--bg:');
  });
});
