import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS } from '../src/consts';

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
    expect(source).toMatch(/from ['"]cartis['"]/);
    expect(source).toContain('mountCartis');
    expect(source).toMatch(/title=\{`Map \| \$\{SITE_TITLE\}`\}/);
    expect(source).toContain("basePath: '/map'");
    expect(source).toContain('data-cartis-host');
    expect(source).toContain('class="map-lab"');
    expect(source).not.toContain('calc(100dvh - 10rem)');
  });

  it('links Map from the labs page as an internal lab', () => {
    const source = readFileSync(labsPagePath, 'utf-8');
    const lab = LABS.find((entry) => entry.label === 'Map');

    expect(lab).toBeDefined();
    expect(lab!.url).toBe('/map');
    expect(lab!.url.startsWith('http')).toBe(false);
    expect(lab!.description.toLowerCase()).toMatch(/map/);
    expect(source).toContain('LABS');
  });

  it('reserves the map slug so blog posts cannot take /map', () => {
    const slugSource = readFileSync(slugPagePath, 'utf-8');
    const headerSource = readFileSync(headerLinkPath, 'utf-8');

    expect(slugSource).toContain("'map'");
    expect(headerSource).toContain("'map'");
  });

  it('imports cartis as an external package', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.dependencies.cartis).toMatch(/^(file:|github:)/);
    expect(pkg.scripts['dev:map']).toBeUndefined();
    expect(pkg.scripts.build).toBe('astro build');
  });
});
