import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS } from '../src/consts';

const vimPagePath = fileURLToPath(new URL('../src/pages/vim.astro', import.meta.url));
const labsPagePath = fileURLToPath(new URL('../src/pages/labs.astro', import.meta.url));
const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));

describe('Vim Dojo site integration', () => {
  it('adds a /vim page using the shared layout pieces', () => {
    const source = readFileSync(vimPagePath, 'utf-8');

    expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(source).toMatch(/from ['"]vim-dojo['"]/);
    expect(source).toContain('mountVimDojo');
    expect(source).toMatch(/title=\{`Vim Dojo \| \$\{SITE_TITLE\}`\}/);
  });

  it('links Vim Dojo from the labs page as an internal lab', () => {
    const source = readFileSync(labsPagePath, 'utf-8');
    const lab = LABS.find((entry) => entry.label === 'Vim Dojo');

    expect(lab).toBeDefined();
    expect(lab!.url).toBe('/vim');
    expect(lab!.description).toContain('Practice Vim');
    expect(source).toContain('LABS');
  });

  it('imports vim-dojo as an external package', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.dependencies['vim-dojo']).toMatch(/^(file:|github:)/);
    expect(pkg.dependencies['@replit/codemirror-vim']).toBeUndefined();
  });
});
