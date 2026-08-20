import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pagePath = fileURLToPath(new URL('../src/pages/terbilang.astro', import.meta.url));
const source = readFileSync(pagePath, 'utf-8');

describe('src/pages/terbilang.astro', () => {
	it('imports and renders the Terbilang component', () => {
		expect(source).toMatch(
			/import Terbilang from ['"]\.\.\/components\/terbilang\/Terbilang\.astro['"]/,
		);
		expect(source).toMatch(/<Terbilang\s*\/>/);
	});

	it('imports and renders the shared Header and Footer', () => {
		expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
		expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
		expect(source).toContain('<Header />');
		expect(source).toContain('<Footer />');
	});

	it('sets a page title that includes the site title', () => {
		expect(source).toMatch(/title=\{`Terbilang \| \$\{SITE_TITLE\}`\}/);
	});

	it('says conversion stays in the browser', () => {
		expect(source.toLowerCase()).toContain('nothing is sent anywhere');
	});
});
