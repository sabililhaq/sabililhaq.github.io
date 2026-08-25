import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const headerPath = fileURLToPath(new URL('../src/components/Header.astro', import.meta.url));
const toastPath = fileURLToPath(new URL('../src/components/DesktopOnlyToast.astro', import.meta.url));
const header = readFileSync(headerPath, 'utf-8');
const toast = readFileSync(toastPath, 'utf-8');

describe('desktop-only toast', () => {
	it('mounts from the shared header so desktop-only routes can show it', () => {
		expect(header).toContain("import DesktopOnlyToast from './DesktopOnlyToast.astro'");
		expect(header).toContain('<DesktopOnlyToast />');
	});

	it('renders the vim-dojo auto-continue toast over a dimmed backdrop', () => {
		expect(toast).toContain('isDesktopOnly');
		expect(toast).toContain('shouldShowDesktopToast');
		expect(toast).toContain('data-desktop-toast-layer');
		expect(toast).toContain('data-desktop-toast-backdrop');
		expect(toast).toContain('data-desktop-toast');
		expect(toast).toContain('Currently only desktop is supported.');
		expect(toast).toContain('auto-continue');
		expect(toast).toContain('auto-continue-fill');
		expect(toast).toContain('Hiding in');
		expect(toast).toContain('role="status"');
		expect(toast).toContain('desktop-toast-backdrop');
	});
});
