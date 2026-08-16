import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const copyCodePath = fileURLToPath(new URL('../src/components/CopyCode.astro', import.meta.url));
const layoutPath = fileURLToPath(new URL('../src/layouts/BlogPost.astro', import.meta.url));
const copyCode = readFileSync(copyCodePath, 'utf-8');
const layout = readFileSync(layoutPath, 'utf-8');

describe('copy code snippets', () => {
	it('is mounted on the blog post layout', () => {
		expect(layout).toContain("import CopyCode from '../components/CopyCode.astro'");
		expect(layout).toContain('<CopyCode />');
	});

	it('copies the pre text with the clipboard API', () => {
		expect(copyCode).toContain('navigator.clipboard.writeText');
		expect(copyCode).toContain('pre.textContent');
		expect(copyCode).toContain("aria-label', 'Copy code'");
	});

	it('reveals the button on hover and keeps it available on touch', () => {
		expect(copyCode).toContain('.code-block:hover .copy-code');
		expect(copyCode).toContain('.code-block:focus-within .copy-code');
		expect(copyCode).toContain('@media (hover: none)');
	});
});
