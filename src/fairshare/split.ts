/** Largest-remainder split so integer shares sum to `total`. */
export function splitInteger(weights: number[], total: number): number[] {
	const n = weights.length;
	if (n === 0) return [];
	if (total <= 0) return Array.from({ length: n }, () => 0);

	const sum = weights.reduce((acc, w) => acc + w, 0);
	if (sum <= 0) return Array.from({ length: n }, () => 0);

	const exact = weights.map((w) => (w / sum) * total);
	const floors = exact.map((x) => Math.floor(x));
	let left = total - floors.reduce((acc, x) => acc + x, 0);

	const order = exact
		.map((x, i) => ({ i, frac: x - floors[i] }))
		.sort((a, b) => b.frac - a.frac || a.i - b.i);

	const out = floors.slice();
	for (let k = 0; k < left; k++) out[order[k]!.i]++;
	return out;
}

/**
 * Integer max-min fairness: process increasing demand, each getting
 * min(demand, floor(remaining / remainingCount)).
 */
export function maxMinFair(demands: number[], capacity: number): number[] {
	const n = demands.length;
	if (n === 0) return [];
	if (capacity <= 0) return Array.from({ length: n }, () => 0);

	const order = demands
		.map((_, i) => i)
		.sort((a, b) => demands[a]! - demands[b]! || a - b);
	const alloc = Array.from({ length: n }, () => 0);
	let left = capacity;
	let remaining = n;

	for (const i of order) {
		const share = Math.floor(left / remaining);
		const give = Math.min(Math.max(0, demands[i]!), share);
		alloc[i] = give;
		left -= give;
		remaining--;
	}

	return alloc;
}
