import { describe, expect, it } from 'vitest';
import { posterRedirectPath } from './poster-redirect';

describe('posterRedirectPath', () => {
	it('leaves plain map URLs on /map', () => {
		expect(posterRedirectPath('')).toBeNull();
		expect(posterRedirectPath('?')).toBeNull();
		expect(posterRedirectPath('?foo=1', '#px=abc')).toBeNull();
	});

	it('sends the old art mode to /poster and drops mode', () => {
		expect(posterRedirectPath('?mode=art')).toBe('/poster');
		expect(posterRedirectPath('mode=art')).toBe('/poster');
		expect(posterRedirectPath('?mode=art&x=1')).toBe('/poster?x=1');
		expect(posterRedirectPath('?x=1&mode=art')).toBe('/poster?x=1');
	});

	it('sends cartis share state to /poster', () => {
		expect(posterRedirectPath('?state=gz.abc')).toBe('/poster?state=gz.abc');
		expect(posterRedirectPath('?mode=art&state=gz.abc')).toBe('/poster?state=gz.abc');
	});

	it('keeps the hash', () => {
		expect(posterRedirectPath('?mode=art', '#theme=dark')).toBe('/poster#theme=dark');
	});
});
