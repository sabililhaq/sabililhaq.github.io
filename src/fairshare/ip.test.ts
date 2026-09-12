import { describe, expect, it } from 'vitest';
import { formatCidr, intToIp, ipToInt, prefixKey } from './ip';

describe('ip', () => {
	it('round-trips dotted quads, including high octets', () => {
		expect(intToIp(ipToInt(10, 0, 1, 1))).toBe('10.0.1.1');
		expect(intToIp(ipToInt(198, 51, 100, 80))).toBe('198.51.100.80');
		expect(intToIp(ipToInt(203, 0, 113, 25))).toBe('203.0.113.25');
	});

	it('masks to a /24 network', () => {
		const ip = ipToInt(198, 51, 100, 80);
		const network = prefixKey(ip, 24);
		expect(intToIp(network)).toBe('198.51.100.0');
		expect(formatCidr(network, 24)).toBe('198.51.100.0/24');
	});

	it('keeps a /32 as the host itself', () => {
		const ip = ipToInt(10, 0, 1, 1);
		expect(prefixKey(ip, 32)).toBe(ip);
	});
});
