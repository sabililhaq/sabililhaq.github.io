/** IPv4 helpers. Addresses are unsigned 32-bit ints. */

export function ipToInt(a: number, b: number, c: number, d: number): number {
	return (((a & 255) << 24) | ((b & 255) << 16) | ((c & 255) << 8) | (d & 255)) >>> 0;
}

export function intToIp(n: number): string {
	const x = n >>> 0;
	return `${(x >>> 24) & 255}.${(x >>> 16) & 255}.${(x >>> 8) & 255}.${x & 255}`;
}

export function prefixKey(ip: number, prefixLen: number): number {
	if (prefixLen <= 0) return 0;
	if (prefixLen >= 32) return ip >>> 0;
	const mask = (0xffffffff << (32 - prefixLen)) >>> 0;
	return (ip & mask) >>> 0;
}

export function formatCidr(network: number, prefixLen: number): string {
	return `${intToIp(network)}/${prefixLen}`;
}
