/** Old combined /map URLs that should open the poster lab instead. */
export function posterRedirectPath(search: string, hash = ''): string | null {
	const query = search.startsWith('?') ? search.slice(1) : search;
	const params = new URLSearchParams(query);
	const isArtMode = params.get('mode') === 'art';
	const isCartisState = params.has('state');
	if (!isArtMode && !isCartisState) return null;

	params.delete('mode');
	const next = params.toString();
	return `/poster${next ? `?${next}` : ''}${hash}`;
}
