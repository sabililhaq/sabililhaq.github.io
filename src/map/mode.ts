export const MAP_MODES = ['proximity', 'art'] as const;

export type MapMode = (typeof MAP_MODES)[number];

export const DEFAULT_MAP_MODE: MapMode = 'proximity';

export function parseMapMode(value: string | null | undefined): MapMode {
	return value === 'art' ? 'art' : DEFAULT_MAP_MODE;
}

export function modeFromSearch(search: string): MapMode {
	const query = search.startsWith('?') ? search.slice(1) : search;
	return parseMapMode(new URLSearchParams(query).get('mode'));
}

export function searchWithMode(search: string, mode: MapMode): string {
	const query = search.startsWith('?') ? search.slice(1) : search;
	const params = new URLSearchParams(query);
	if (mode === DEFAULT_MAP_MODE) params.delete('mode');
	else params.set('mode', mode);
	const next = params.toString();
	return next ? `?${next}` : '';
}
