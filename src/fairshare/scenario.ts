import { ipToInt, prefixKey } from './ip';
import type { Policy } from './policy';
import { DEFAULT_POLICY } from './policy';
import { AUTO_CELLS, MAP_W, SERVER_CELL, landCells, type Cell } from './world';

export type Kind = 'good' | 'attack';
export type Camp = 'scattered' | 'nat' | 'auto' | 'user';

export interface Flow {
	ip: number;
	kind: Kind;
	offered: number;
	camp: Camp;
}

export interface SimConfig {
	originCapacity: number;
	prefixLen: number;
	perIpRate: number;
	perIpBurst: number;
	prefixCapShare: number;
	policy: Policy;
}

export interface ScenarioInput {
	scatteredGood: number;
	natGood: number;
	bots: number;
	botRate: number;
}

/** RFC 5737 documentation ranges — obviously fake, never routed. */
export const NAT_NETWORK = ipToInt(203, 0, 113, 0);
export const ATTACK_NETWORK = ipToInt(198, 51, 100, 0);

export const DEFAULT_SCENARIO: ScenarioInput = {
	scatteredGood: 40,
	natGood: 25,
	bots: 80,
	botRate: 10,
};

export const DEFAULT_CONFIG: SimConfig = {
	originCapacity: 100,
	prefixLen: 24,
	perIpRate: 2,
	perIpBurst: 4,
	prefixCapShare: 0.15,
	policy: DEFAULT_POLICY,
};

/** Quiet ticks before the botnet starts, then a short ramp to full flood. */
export const QUIET_SECONDS = 4;
export const RAMP_SECONDS = 3;

export function attackScaleAt(t: number): number {
	if (t < QUIET_SECONDS) return 0;
	return Math.min(1, (t - QUIET_SECONDS + 1) / RAMP_SECONDS);
}

export function scaleAttack(flows: Flow[], scale: number): Flow[] {
	if (scale >= 1) return flows;
	return flows.map((flow) => {
		if (flow.camp !== 'auto') return flow;
		if (scale <= 0) return { ...flow, offered: 0 };
		return { ...flow, offered: Math.round(flow.offered * scale) };
	});
}

export function natPrefix(prefixLen = DEFAULT_CONFIG.prefixLen): number {
	return prefixKey(NAT_NETWORK, prefixLen);
}

export function attackPrefix(prefixLen = DEFAULT_CONFIG.prefixLen): number {
	return prefixKey(ATTACK_NETWORK, prefixLen);
}

export function buildFlows(input: Partial<ScenarioInput> = {}): Flow[] {
	const scatteredGood = input.scatteredGood ?? DEFAULT_SCENARIO.scatteredGood;
	const natGood = input.natGood ?? DEFAULT_SCENARIO.natGood;
	const bots = input.bots ?? DEFAULT_SCENARIO.bots;
	const botRate = input.botRate ?? DEFAULT_SCENARIO.botRate;
	const flows: Flow[] = [];

	for (let i = 1; i <= scatteredGood; i++) {
		flows.push({ ip: ipToInt(10, 0, i, 1), kind: 'good', offered: 1, camp: 'scattered' });
	}

	for (let i = 1; i <= natGood; i++) {
		flows.push({ ip: ipToInt(203, 0, 113, i), kind: 'good', offered: 1, camp: 'nat' });
	}

	const botCount = Math.min(Math.max(0, bots), 254);
	for (let i = 1; i <= botCount; i++) {
		flows.push({
			ip: ipToInt(198, 51, 100, i),
			kind: 'attack',
			offered: botRate,
			camp: 'auto',
		});
	}

	return flows;
}

export interface UserSource {
	x: number;
	y: number;
	bots: number;
	botRate: number;
}

export const DEFAULT_USER_BOTS = 25;
export const DEFAULT_USER_RATE = 8;
export const AUTO_BOTS_PER_CELL = 20;
export const AUTO_BOT_RATE = 10;

export function cellNetwork(cell: Cell): number {
	const idx = cell.y * MAP_W + cell.x;
	return ipToInt(10, (idx >> 8) & 255, idx & 255, 0);
}

function hostsOnCell(
	cell: Cell,
	count: number,
	kind: Kind,
	camp: Camp,
	offered: number,
): Flow[] {
	const base = cellNetwork(cell);
	const n = Math.min(Math.max(0, count), 254);
	const flows: Flow[] = [];
	for (let i = 1; i <= n; i++) {
		flows.push({ ip: (base + i) >>> 0, kind, offered, camp });
	}
	return flows;
}

function reservedKeys(extra: Cell[]): Set<string> {
	const keys = new Set<string>([`${SERVER_CELL.x},${SERVER_CELL.y}`]);
	for (const cell of AUTO_CELLS) keys.add(`${cell.x},${cell.y}`);
	for (const cell of extra) keys.add(`${cell.x},${cell.y}`);
	return keys;
}

export function buildWorldFlows(input: {
	autoOn?: boolean;
	userSources?: UserSource[];
	scatteredGood?: number;
	natGood?: number;
} = {}): Flow[] {
	const scatteredGood = input.scatteredGood ?? DEFAULT_SCENARIO.scatteredGood;
	const natGood = input.natGood ?? DEFAULT_SCENARIO.natGood;
	const userSources = input.userSources ?? [];
	const autoOn = input.autoOn ?? true;
	const flows: Flow[] = [];

	const blocked = reservedKeys(userSources);
	const land = landCells().filter((cell) => !blocked.has(`${cell.x},${cell.y}`));
	const step = Math.max(1, Math.floor(land.length / Math.max(1, scatteredGood)));
	for (let i = 0; i < scatteredGood; i++) {
		const cell = land[Math.min(i * step, land.length - 1)];
		if (!cell) break;
		flows.push(...hostsOnCell(cell, 1, 'good', 'scattered', 1));
	}

	const natCell = landCells().find(
		(cell) =>
			Math.abs(cell.x - SERVER_CELL.x) + Math.abs(cell.y - SERVER_CELL.y) === 1 &&
			!userSources.some((s) => s.x === cell.x && s.y === cell.y),
	) ?? SERVER_CELL;
	flows.push(...hostsOnCell(natCell, natGood, 'good', 'nat', 1));

	if (autoOn) {
		for (const cell of AUTO_CELLS) {
			flows.push(...hostsOnCell(cell, AUTO_BOTS_PER_CELL, 'attack', 'auto', AUTO_BOT_RATE));
		}
	}

	for (const source of userSources) {
		flows.push(
			...hostsOnCell(
				{ x: source.x, y: source.y },
				source.bots,
				'attack',
				'user',
				source.botRate,
			),
		);
	}

	return flows;
}
