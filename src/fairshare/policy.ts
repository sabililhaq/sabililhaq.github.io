export const POLICIES = ['open', 'per-ip', 'prefix-cap', 'fair-share'] as const;

export type Policy = (typeof POLICIES)[number];

export const DEFAULT_POLICY: Policy = 'open';

export function parsePolicy(value: string | null | undefined): Policy {
	return POLICIES.find((policy) => policy === value) ?? DEFAULT_POLICY;
}

export function policyFromSearch(search: string): Policy {
	const query = search.startsWith('?') ? search.slice(1) : search;
	return parsePolicy(new URLSearchParams(query).get('policy'));
}

export function searchWithPolicy(search: string, policy: Policy): string {
	const query = search.startsWith('?') ? search.slice(1) : search;
	const params = new URLSearchParams(query);
	if (policy === DEFAULT_POLICY) params.delete('policy');
	else params.set('policy', policy);
	const next = params.toString();
	return next ? `?${next}` : '';
}
