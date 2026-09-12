import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LABS, PROJECTS } from '../src/consts';

const pagePath = fileURLToPath(new URL('../src/pages/fairshare.astro', import.meta.url));
const labPath = fileURLToPath(
	new URL('../src/components/fairshare/FairshareLab.astro', import.meta.url),
);
const slugPagePath = fileURLToPath(new URL('../src/pages/[slug].astro', import.meta.url));
const headerLinkPath = fileURLToPath(
	new URL('../src/components/HeaderLink.astro', import.meta.url),
);

describe('fairshare lab', () => {
	it('adds a /fairshare page using the shared layout pieces', () => {
		const source = readFileSync(pagePath, 'utf-8');

		expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
		expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
		expect(source).toMatch(
			/import FairshareLab from ['"]\.\.\/components\/fairshare\/FairshareLab\.astro['"]/,
		);
		expect(source).toContain('<FairshareLab />');
		expect(source).toMatch(/title=\{`Fairshare \| \$\{SITE_TITLE\}`\}/);
		expect(source.toLowerCase()).toContain('seat');
		expect(source.toLowerCase()).toContain('flood');
	});

	it('compares four policies in the browser, with no backend import', () => {
		const lab = readFileSync(labPath, 'utf-8');

		expect(lab).toContain('data-policy="open"');
		expect(lab).toContain('data-policy="per-ip"');
		expect(lab).toContain('data-policy="prefix-cap"');
		expect(lab).toContain('data-policy="fair-share"');
		expect(lab).toContain("from '../../fairshare/simulate'");
		expect(lab).toContain('createSim');
		expect(lab).toContain('id="seats"');
		expect(lab).toContain('id="world"');
		expect(lab).toContain('id="auto-flood"');
		expect(lab).toContain('id="run-replay"');
		expect(lab).toContain('Click land');
		expect(lab).toContain('Nothing is sent to a network');
		expect(lab).not.toMatch(/fetch\(|WebSocket|localhost:\d+/);
	});

	it('links Fairshare from the labs catalog as an internal playground', () => {
		const lab = LABS.find((entry) => entry.label === 'Fairshare');

		expect(lab).toBeDefined();
		expect(lab!.url).toBe('/fairshare');
		expect(lab!.url.startsWith('http')).toBe(false);
		expect(lab!.description).toMatch(/flood/i);
		expect(lab!.note).toBe('playground');
		expect(LABS.findIndex((entry) => entry.label === 'Fairshare')).toBeGreaterThan(
			LABS.findIndex((entry) => entry.label === 'Map'),
		);
		expect(LABS.findIndex((entry) => entry.label === 'Fairshare')).toBeLessThan(
			LABS.findIndex((entry) => entry.label === 'Chat'),
		);
	});

	it('reserves the fairshare slug so blog posts cannot take /fairshare', () => {
		const slugSource = readFileSync(slugPagePath, 'utf-8');
		const headerSource = readFileSync(headerLinkPath, 'utf-8');

		expect(slugSource).toContain("'fairshare'");
		expect(headerSource).toContain("'fairshare'");
	});

	it('is a lab, not a listed project yet', () => {
		expect(PROJECTS.some((project) => project.liveDemo === '/fairshare')).toBe(false);
	});
});
