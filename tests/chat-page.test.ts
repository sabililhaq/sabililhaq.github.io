import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const chatPagePath = fileURLToPath(new URL('../src/pages/chat.astro', import.meta.url));
const source = readFileSync(chatPagePath, 'utf-8');

describe('src/pages/chat.astro', () => {
  it('imports and renders the ChatWidget component', () => {
    expect(source).toMatch(/import ChatWidget from ['"]\.\.\/components\/chat\/ChatWidget\.astro['"]/);
    expect(source).toMatch(/<ChatWidget\s*\/>/);
  });

  it('imports and renders the shared Header and Footer', () => {
    expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(source).toContain('<Header />');
    expect(source).toContain('<Footer />');
  });

  it('sets a page title that includes the site title', () => {
    expect(source).toMatch(/title=\{`Chat \| \$\{SITE_TITLE\}`\}/);
  });

  it('describes the chat as anonymous and temporary', () => {
    expect(source.toLowerCase()).toContain('anonymous');
    expect(source.toLowerCase()).toContain('temporary');
  });
});