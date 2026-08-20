import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS, PROJECTS } from '../src/consts';

const vimPagePath = fileURLToPath(new URL('../src/pages/vim.astro', import.meta.url));
const roadmapPagePath = fileURLToPath(new URL('../src/pages/vim/roadmap.astro', import.meta.url));
const projectsPagePath = fileURLToPath(new URL('../src/pages/projects.astro', import.meta.url));
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
    expect(source).toContain("basePath: '/vim'");
    expect(source).toContain('href="/vim/roadmap"');
    expect(source.indexOf('data-vim-dojo-host')).toBeLessThan(source.indexOf('class="dojo-nav"'));
    expect(source).not.toContain('order: -1');
    expect(source).not.toContain('category · random · daily · interactive hints');
  });

  it('points the learning roadmap at the vim-dojo repo instead of copying it', () => {
    const project = PROJECTS.find((entry) => entry.id === 'vim-dojo');
    const page = readFileSync(roadmapPagePath, 'utf-8');
    const projectsPage = readFileSync(projectsPagePath, 'utf-8');

    expect(project?.roadmap).toBe('/vim/roadmap');
    expect(projectsPage).toContain('project.roadmap');
    expect(page).toMatch(/learning tool/i);
    expect(page).toContain('https://github.com/sabililhaq/vim-dojo/blob/main/ROADMAP.md');
    expect(page).toMatch(/category play/i);
    expect(page).toMatch(/random review/i);
    expect(page).toMatch(/daily kata/i);
    expect(page).toMatch(/interactive hints/i);
    expect(page).toMatch(/ghost/i);
    expect(page).not.toContain('VIM_DOJO_ROADMAP');
    expect(page).not.toContain('ROADMAP_GROUPS');
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
