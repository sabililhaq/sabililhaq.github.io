import { describe, expect, it } from 'vitest';
import { DEFAULT_POLICY, parsePolicy, policyFromSearch, searchWithPolicy } from './policy';

describe('policy query string', () => {
	it('defaults to open', () => {
		expect(DEFAULT_POLICY).toBe('open');
		expect(parsePolicy(null)).toBe('open');
		expect(parsePolicy('nope')).toBe('open');
		expect(policyFromSearch('')).toBe('open');
	});

	it('reads a known policy from the query string', () => {
		expect(parsePolicy('fair-share')).toBe('fair-share');
		expect(policyFromSearch('?policy=per-ip')).toBe('per-ip');
		expect(policyFromSearch('policy=prefix-cap&x=1')).toBe('prefix-cap');
	});

	it('omits the default policy from the query string', () => {
		expect(searchWithPolicy('?policy=fair-share', 'open')).toBe('');
		expect(searchWithPolicy('', 'fair-share')).toBe('?policy=fair-share');
		expect(searchWithPolicy('?x=1', 'fair-share')).toBe('?x=1&policy=fair-share');
	});
});
