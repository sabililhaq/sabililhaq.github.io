import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS, PROJECTS } from '../src/consts';

const mapPagePath = fileURLToPath(new URL('../src/pages/map.astro', import.meta.url));
const labsPagePath = fileURLToPath(new URL('../src/pages/labs.astro', import.meta.url));
const slugPagePath = fileURLToPath(new URL('../src/pages/[slug].astro', import.meta.url));
const headerLinkPath = fileURLToPath(new URL('../src/components/HeaderLink.astro', import.meta.url));
const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url));

describe('map lab', () => {
  it('adds a /map page using the shared layout pieces', () => {
    const source = readFileSync(mapPagePath, 'utf-8');

    expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(source).toMatch(/import\(['"]cartis['"]\)/);
    expect(source).toMatch(/import\(['"]geoproximity['"]\)/);
    expect(source).toContain('mountCartis');
    expect(source).toContain('mountProximity');
    expect(source).toMatch(/title=\{`Map \| \$\{SITE_TITLE\}`\}/);
    expect(source).toContain('Rank places by distance, or style a map poster.');
    expect(source).toContain("basePath: '/map'");
    expect(source).toContain('data-art-host');
    expect(source).toContain('data-proximity-host');
    expect(source).toMatch(
      /data-map-mode="proximity"[^>]*>Proximity<\/button>[\s\S]*data-map-mode="art"[^>]*>Poster<\/button>/,
    );
    expect(source).toMatch(/data-map-mode="proximity"[^>]*aria-selected="true"/);
    expect(source).toContain('sample: true');
    expect(source).toContain('ensureArtFonts');
    expect(source).not.toMatch(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);
    expect(source).toContain('id="map-art-host"');
    expect(source).toMatch(/id="map-art-host"[^>]*hidden/);
    expect(source).toContain('class="map-lab"');
    expect(source).not.toContain('calc(100dvh - 10rem)');
    expect(source).toContain('flex: 1 1 0%');
    expect(source).toContain('height: 100dvh');
    expect(source).toMatch(/html\.map-lab body > main[\s\S]*overflow: hidden/);
    expect(source).toMatch(/data-map-stage[\s\S]*class="map-mode-bar"/);
    expect(source).toMatch(/html\.map-lab \.map-mode-bar[\s\S]*position: absolute/);
    expect(source).toMatch(/html\.map-lab \.map-mode-bar[\s\S]*left: 50%/);
    expect(source).toMatch(/html\.map-lab \.map-mode-bar[\s\S]*pointer-events: none/);
    expect(source).not.toMatch(/html\.map-lab \.map-mode-bar[\s\S]*flex-shrink: 0/);
    expect(source).toMatch(
      /html\.map-lab \[data-art-host\],\s*html\.map-lab \[data-proximity-host\][\s\S]*z-index: 0/,
    );
    expect(source).toMatch(
      /html\.map-lab \[data-cartis\] aside[\s\S]*background:\s*rgb\(var\(--bg\)\)/,
    );
    expect(source).toMatch(
      /html\.map-lab \[data-cartis\] \.input-field[\s\S]*background:\s*rgb\(var\(--surface\)\)/,
    );
    expect(source).toMatch(
      /html\.map-lab\[data-theme='dark'\] \[data-cartis\] aside \.text-slate-900[\s\S]*color:\s*rgb\(var\(--black\)\)/,
    );
  });

  it('links Map from the labs page as an internal lab', () => {
    const source = readFileSync(labsPagePath, 'utf-8');
    const lab = LABS.find((entry) => entry.label === 'Map');

    expect(lab).toBeDefined();
    expect(lab!.url).toBe('/map');
    expect(lab!.url.startsWith('http')).toBe(false);
    expect(lab!.description).toBe('Rank places by distance, or style a map poster.');
    expect(source).toContain('LABS');
  });

  it('reserves the map slug so blog posts cannot take /map', () => {
    const slugSource = readFileSync(slugPagePath, 'utf-8');
    const headerSource = readFileSync(headerLinkPath, 'utf-8');

    expect(slugSource).toContain("'map'");
    expect(headerSource).toContain("'map'");
  });

  it('lists Geoproximity as a current project with a live map demo', () => {
    const project = PROJECTS.find((entry) => entry.id === 'geoproximity');

    expect(project).toBeDefined();
    expect(project!.group).toBe('now');
    expect(PROJECTS.findIndex((entry) => entry.id === 'geoproximity')).toBeLessThan(
      PROJECTS.findIndex((entry) => entry.id === 'vim-dojo'),
    );
    expect(project!.liveDemo).toBe('/map');
    expect(project!.sourceCode).toBe('https://github.com/sabililhaq/geoproximity');
    expect(project!.roadmap).toBeUndefined();
    expect(project!.image).toBe('/images/projects/geoproximity.png');
    expect(
      existsSync(fileURLToPath(new URL('../public/images/projects/geoproximity.png', import.meta.url))),
    ).toBe(true);
    expect(project!.overview.join(' ')).toMatch(/google maps/i);
    expect(project!.overview.join(' ')).toMatch(/entirely in the browser/i);
    expect(project!.overview.join(' ')).toMatch(/no backend/i);
    expect(project!.overview.join(' ')).toMatch(/locally/);
    expect(project!.overview.join(' ')).toMatch(/application server/i);
    expect(project!.overview.join(' ')).not.toMatch(/street routing|roadmap/i);
  });

  it('imports cartis and geoproximity as external packages', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.dependencies.cartis).toMatch(/^github:/);
    expect(pkg.dependencies.geoproximity).toMatch(/^(file:|github:)/);
    expect(pkg.dependencies.leaflet).toBeDefined();
    expect(pkg.scripts['dev:map']).toBeUndefined();
    expect(pkg.scripts.build).toBe('astro build');
  });
});
