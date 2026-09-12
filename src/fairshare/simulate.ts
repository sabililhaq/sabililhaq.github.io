import { formatCidr, prefixKey } from './ip';
import { attackScaleAt, QUIET_SECONDS, RAMP_SECONDS, scaleAttack } from './scenario';
import type { Camp, Flow, SimConfig } from './scenario';
import { maxMinFair, splitInteger } from './split';

export type { Camp, Flow, SimConfig } from './scenario';

export interface PrefixStats {
	network: number;
	prefixLen: number;
	cidr: string;
	offeredGood: number;
	offeredAttack: number;
	edgePassGood: number;
	edgePassAttack: number;
	originAcceptGood: number;
	originAcceptAttack: number;
}

export interface ClientFate {
	ip: number;
	kind: Flow['kind'];
	camp: Camp;
	offered: number;
	accepted: number;
}

export interface TickResult {
	t: number;
	attackScale: number;
	offeredGood: number;
	offeredAttack: number;
	edgePassGood: number;
	edgePassAttack: number;
	originAcceptGood: number;
	originAcceptAttack: number;
	originAcceptAuto: number;
	originAcceptUser: number;
	originDropGood: number;
	originDropAttack: number;
	originCapacity: number;
	prefixes: PrefixStats[];
	clients: ClientFate[];
}

class TokenBuckets {
	private tokens = new Map<number, number>();

	constructor(
		private rate: number,
		private burst: number,
	) {}

	reset(): void {
		this.tokens.clear();
	}

	configure(rate: number, burst: number): void {
		if (rate !== this.rate || burst !== this.burst) this.reset();
		this.rate = rate;
		this.burst = burst;
	}

	take(ip: number, offered: number): number {
		let t = this.tokens.get(ip);
		if (t === undefined) t = this.rate;
		const got = Math.min(offered, Math.max(0, Math.floor(t)));
		this.tokens.set(ip, Math.min(this.burst, t - got + this.rate));
		return got;
	}
}

function groupIndices(flows: Flow[], prefixLen: number): Map<number, number[]> {
	const groups = new Map<number, number[]>();
	for (let i = 0; i < flows.length; i++) {
		const key = prefixKey(flows[i]!.ip, prefixLen);
		const list = groups.get(key);
		if (list) list.push(i);
		else groups.set(key, [i]);
	}
	return groups;
}

function splitAcross(indices: number[], weights: number[], budget: number, dest: number[]): void {
	const parts = splitInteger(weights, budget);
	for (let k = 0; k < indices.length; k++) {
		dest[indices[k]!] = Math.min(weights[k]!, parts[k]!);
	}
}

function offeredWeights(flows: Flow[], indices: number[]): number[] {
	return indices.map((i) => flows[i]!.offered);
}

function applyPrefixCap(flows: Flow[], admitted: number[], config: SimConfig): void {
	const cap = Math.max(0, Math.round(config.prefixCapShare * config.originCapacity));
	const groups = groupIndices(flows, config.prefixLen);
	for (const indices of groups.values()) {
		const weights = offeredWeights(flows, indices);
		const offered = weights.reduce((sum, n) => sum + n, 0);
		splitAcross(indices, weights, Math.min(offered, cap), admitted);
	}
}

function applyFairShare(flows: Flow[], admitted: number[], config: SimConfig): void {
	const groups = [...groupIndices(flows, config.prefixLen).values()];
	const demands = groups.map((indices) =>
		indices.reduce((sum, i) => sum + flows[i]!.offered, 0),
	);
	const allocs = maxMinFair(demands, config.originCapacity);
	for (let g = 0; g < groups.length; g++) {
		const indices = groups[g]!;
		splitAcross(indices, offeredWeights(flows, indices), allocs[g]!, admitted);
	}
}

function admitOrigin(
	flows: Flow[],
	admitted: number[],
	capacity: number,
	prefixLen: number,
): number[] {
	const total = admitted.reduce((sum, n) => sum + n, 0);
	if (total <= capacity) return admitted.slice();

	let goodWeight = 0;
	let attackWeight = 0;
	for (let i = 0; i < flows.length; i++) {
		if (flows[i]!.kind === 'good') goodWeight += admitted[i]!;
		else attackWeight += admitted[i]!;
	}
	const [goodBudget, attackBudget] = splitInteger([goodWeight, attackWeight], capacity);

	const accepted = Array.from({ length: flows.length }, () => 0);

	function fill(kind: Flow['kind'], budget: number): void {
		const groups: number[][] = [];
		const index = new Map<number, number>();
		for (let i = 0; i < flows.length; i++) {
			if (flows[i]!.kind !== kind) continue;
			const key = prefixKey(flows[i]!.ip, prefixLen);
			let g = index.get(key);
			if (g === undefined) {
				g = groups.length;
				index.set(key, g);
				groups.push([]);
			}
			groups[g]!.push(i);
		}

		const weights = groups.map((indices) =>
			indices.reduce((sum, i) => sum + admitted[i]!, 0),
		);
		const parts = splitInteger(weights, budget);
		for (let g = 0; g < groups.length; g++) {
			const indices = groups[g]!;
			splitAcross(
				indices,
				indices.map((i) => admitted[i]!),
				parts[g]!,
				accepted,
			);
		}
	}

	fill('good', goodBudget!);
	fill('attack', attackBudget!);
	return accepted;
}

function emptyPrefix(network: number, prefixLen: number): PrefixStats {
	return {
		network,
		prefixLen,
		cidr: formatCidr(network, prefixLen),
		offeredGood: 0,
		offeredAttack: 0,
		edgePassGood: 0,
		edgePassAttack: 0,
		originAcceptGood: 0,
		originAcceptAttack: 0,
	};
}

function summarize(
	flows: Flow[],
	admitted: number[],
	accepted: number[],
	config: SimConfig,
	t: number,
	attackScale: number,
): TickResult {
	const prefixes = new Map<number, PrefixStats>();
	const clients: ClientFate[] = [];
	let offeredGood = 0;
	let offeredAttack = 0;
	let edgePassGood = 0;
	let edgePassAttack = 0;
	let originAcceptGood = 0;
	let originAcceptAttack = 0;
	let originAcceptAuto = 0;
	let originAcceptUser = 0;

	for (let i = 0; i < flows.length; i++) {
		const flow = flows[i]!;
		const network = prefixKey(flow.ip, config.prefixLen);
		let row = prefixes.get(network);
		if (!row) {
			row = emptyPrefix(network, config.prefixLen);
			prefixes.set(network, row);
		}

		clients.push({
			ip: flow.ip,
			kind: flow.kind,
			camp: flow.camp,
			offered: flow.offered,
			accepted: accepted[i]!,
		});
		if (flow.camp === 'auto') originAcceptAuto += accepted[i]!;
		if (flow.camp === 'user') originAcceptUser += accepted[i]!;

		if (flow.kind === 'good') {
			offeredGood += flow.offered;
			edgePassGood += admitted[i]!;
			originAcceptGood += accepted[i]!;
			row.offeredGood += flow.offered;
			row.edgePassGood += admitted[i]!;
			row.originAcceptGood += accepted[i]!;
		} else {
			offeredAttack += flow.offered;
			edgePassAttack += admitted[i]!;
			originAcceptAttack += accepted[i]!;
			row.offeredAttack += flow.offered;
			row.edgePassAttack += admitted[i]!;
			row.originAcceptAttack += accepted[i]!;
		}
	}

	return {
		t,
		attackScale,
		offeredGood,
		offeredAttack,
		edgePassGood,
		edgePassAttack,
		originAcceptGood,
		originAcceptAttack,
		originAcceptAuto,
		originAcceptUser,
		originDropGood: edgePassGood - originAcceptGood,
		originDropAttack: edgePassAttack - originAcceptAttack,
		originCapacity: config.originCapacity,
		prefixes: [...prefixes.values()].sort(
			(a, b) =>
				b.offeredGood +
				b.offeredAttack -
				(a.offeredGood + a.offeredAttack),
		),
		clients,
	};
}

export interface Simulator {
	tick(): TickResult;
	reset(): void;
	skipToFlood(): void;
	time(): number;
	setConfig(config: SimConfig): void;
	setFlows(flows: Flow[]): void;
}

export function createSim(config: SimConfig, flows: Flow[]): Simulator {
	let current = config;
	let currentFlows = flows;
	let t = 0;
	const buckets = new TokenBuckets(config.perIpRate, config.perIpBurst);

	function runTick(active: Flow[], scale: number, at: number): TickResult {
		const n = active.length;
		const admitted = Array.from({ length: n }, () => 0);

		switch (current.policy) {
			case 'open':
				for (let i = 0; i < n; i++) admitted[i] = active[i]!.offered;
				break;
			case 'per-ip':
				for (let i = 0; i < n; i++) {
					admitted[i] = buckets.take(active[i]!.ip, active[i]!.offered);
				}
				break;
			case 'prefix-cap':
				applyPrefixCap(active, admitted, current);
				break;
			case 'fair-share':
				applyFairShare(active, admitted, current);
				break;
		}

		const accepted = admitOrigin(active, admitted, current.originCapacity, current.prefixLen);
		return summarize(active, admitted, accepted, current, at, scale);
	}

	return {
		tick() {
			const at = t;
			const scale = attackScaleAt(at);
			const active = scaleAttack(currentFlows, scale);
			const result = runTick(active, scale, at);
			t += 1;
			return result;
		},
		reset() {
			t = 0;
			buckets.reset();
		},
		skipToFlood() {
			t = QUIET_SECONDS + RAMP_SECONDS - 1;
			buckets.reset();
		},
		time() {
			return t;
		},
		setConfig(next) {
			buckets.configure(next.perIpRate, next.perIpBurst);
			if (next.policy !== current.policy) buckets.reset();
			current = next;
		},
		setFlows(next) {
			currentFlows = next;
			buckets.reset();
		},
	};
}
