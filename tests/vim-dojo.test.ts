import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS, PROJECTS } from '../src/consts';

const vimPagePath = fileURLToPath(new URL('../src/pages/vim.astro', import.meta.url));
const labsPagePath = fileURLToPath(new URL('../src/pages/labs.astro', import.meta.url));
const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));
const dojoRoot = fileURLToPath(new URL('../node_modules/vim-dojo/', import.meta.url));

function readDojo(relativePath: string): string {
  return readFileSync(new URL(relativePath, `file://${dojoRoot}`), 'utf-8');
}

describe('Vim Dojo site integration', () => {
  it('adds a /vim page using the shared layout pieces', () => {
    const source = readFileSync(vimPagePath, 'utf-8');

    expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(source).toMatch(/from ['"]vim-dojo['"]/);
    expect(source).toContain('mountVimDojo');
    expect(source).toMatch(/title=\{`Vim Dojo \| \$\{SITE_TITLE\}`\}/);
    expect(source).toContain("basePath: '/vim'");
  });

  it('links Vim Dojo from the labs page as an internal lab', () => {
    const source = readFileSync(labsPagePath, 'utf-8');
    const lab = LABS.find((entry) => entry.label === 'Vim Dojo');

    expect(lab).toBeDefined();
    expect(lab!.url).toBe('/vim');
    expect(lab!.description).toContain('Practice Vim');
    expect(source).toContain('LABS');
  });

  it('presents Vim Dojo as practice, not a beginner tutorial', () => {
    const project = PROJECTS.find((entry) => entry.id === 'vim-dojo');
    const lab = LABS.find((entry) => entry.label === 'Vim Dojo');

    expect(project).toBeDefined();
    expect(project!.overview.join(' ')).toMatch(/not a beginner tutorial/i);
    expect(project!.overview.join(' ')).toMatch(/already know the basics/i);
    expect(project!.liveDemo).toBe('https://sabililhaq.com/vim');
    expect(project!.sourceCode).toBe('https://github.com/sabililhaq/vim-dojo');
    expect(lab!.description).toBe("Practice Vim. Don't learn Vim.");
  });

  it('imports vim-dojo as an external package', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.dependencies['vim-dojo']).toMatch(/^(file:|github:)/);
    expect(pkg.dependencies['@replit/codemirror-vim']).toBeUndefined();
  });
});

describe('Vim Dojo learning (pinned package)', () => {
  const challengeFiles = readdirSync(new URL('src/challenges/', `file://${dojoRoot}`))
    .filter((name) => name.endsWith('.ts') && name !== 'index.ts' && name !== 'types.ts')
    .map((name) => readDojo(`src/challenges/${name}`));
  const challengeSource = challengeFiles.join('\n');
  const template = readDojo('src/template.ts');
  const mount = readDojo('src/mount.ts');

  it('ships a hinted curriculum across motion, operator, text-object, and visual', () => {
    expect(challengeSource).toContain("category: 'motion'");
    expect(challengeSource).toContain("category: 'operator'");
    expect(challengeSource).toContain("category: 'text-object'");
    expect(challengeSource).toContain("category: 'visual'");
    expect(challengeSource.match(/intendedMove:/g)?.length).toBeGreaterThanOrEqual(20);
    expect(challengeSource.match(/hints:/g)?.length).toBeGreaterThanOrEqual(20);
    expect(challengeSource.match(/concepts:/g)?.length).toBeGreaterThanOrEqual(20);
  });

  it('covers core keys a learner should practice', () => {
    for (const move of ['0cw', '$a', 'fecw', 'wcw', 'bcw', 'ct-', 'dd', 'cw', 'dw', 'dW', 'x', 'D', 'ci"', 'ci(', 'ciw', 'ci{', 'daw', 'vec', 'Vd', 'vi"c']) {
      expect(challengeSource).toContain(`intendedMove: '${move}'`);
    }
  });

  it('points beginners to VimHero and teaches the intended move after a solve', () => {
    expect(template).toContain('Practice Vim. Don\'t learn Vim.');
    expect(template).toContain('https://www.vim-hero.com/lessons/basic-movement');
    expect(template).toContain('data-hint-button');
    expect(mount).toContain('function renderHint');
    expect(mount).toContain('was the intended move.');
    expect(mount).toContain('You pasted the solution.');
    expect(mount).toContain('missed some Vim practice');
  });
});
