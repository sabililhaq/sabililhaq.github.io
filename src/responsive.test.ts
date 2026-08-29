import { describe, expect, it } from 'vitest';
import {
	DESKTOP_MIN_WIDTH,
	DESKTOP_ONLY,
	isDesktopOnly,
	normalizePathname,
	shouldShowDesktopToast,
} from './responsive';

describe('desktop-only routes', () => {
	it('lists /vim as the current desktop-only set', () => {
		expect([...DESKTOP_ONLY]).toEqual(['/vim']);
	});

	it('treats those routes and their nested paths as not mobile-ready', () => {
		expect(isDesktopOnly('/vim')).toBe(true);
		expect(isDesktopOnly('/vim/roadmap')).toBe(true);
	});

	it('does not treat other site routes as desktop-only', () => {
		expect(isDesktopOnly('/')).toBe(false);
		expect(isDesktopOnly('/about')).toBe(false);
		expect(isDesktopOnly('/labs')).toBe(false);
		expect(isDesktopOnly('/chat')).toBe(false);
		expect(isDesktopOnly('/qr')).toBe(false);
		expect(isDesktopOnly('/map')).toBe(false);
		expect(isDesktopOnly('/map/')).toBe(false);
		expect(isDesktopOnly('/map?mode=art')).toBe(false);
		expect(isDesktopOnly('/maps')).toBe(false);
		expect(isDesktopOnly('/vimdojo')).toBe(false);
	});
});

describe('normalizePathname', () => {
	it('strips query, hash, and trailing slashes', () => {
		expect(normalizePathname('/vim/roadmap/?x=1#top')).toBe('/vim/roadmap');
		expect(normalizePathname('about')).toBe('/about');
		expect(normalizePathname('/')).toBe('/');
	});
});

describe('shouldShowDesktopToast', () => {
	it('shows on narrow viewports for desktop-only routes', () => {
		expect(shouldShowDesktopToast('/vim', 375)).toBe(true);
		expect(shouldShowDesktopToast('/vim/roadmap', 390)).toBe(true);
	});

	it('hides on desktop and on the rest of the site', () => {
		expect(shouldShowDesktopToast('/map', DESKTOP_MIN_WIDTH - 1)).toBe(false);
		expect(shouldShowDesktopToast('/map', DESKTOP_MIN_WIDTH)).toBe(false);
		expect(shouldShowDesktopToast('/about', 375)).toBe(false);
		expect(shouldShowDesktopToast('/', 390)).toBe(false);
		expect(shouldShowDesktopToast('/labs', 390)).toBe(false);
	});
});
