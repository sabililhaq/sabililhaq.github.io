import { describe, expect, it } from 'vitest';
import { DEFAULT_MAP_MODE, modeFromSearch, parseMapMode, searchWithMode } from './mode';

describe('map mode', () => {
	it('defaults to proximity', () => {
		expect(DEFAULT_MAP_MODE).toBe('proximity');
		expect(parseMapMode(null)).toBe('proximity');
		expect(parseMapMode('nope')).toBe('proximity');
		expect(modeFromSearch('')).toBe('proximity');
	});

	it('reads art from the query string', () => {
		expect(parseMapMode('art')).toBe('art');
		expect(modeFromSearch('?mode=art')).toBe('art');
		expect(modeFromSearch('mode=art&x=1')).toBe('art');
	});

	it('keeps other query params when toggling', () => {
		expect(searchWithMode('?state=abc', 'art')).toBe('?state=abc&mode=art');
		expect(searchWithMode('?mode=art&state=abc', 'proximity')).toBe('?state=abc');
		expect(searchWithMode('?mode=art', 'proximity')).toBe('');
		expect(searchWithMode('', 'proximity')).toBe('');
	});
});
