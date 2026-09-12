import { describe, expect, it } from 'vitest';
import {
	ATTACK_NETWORK,
	DEFAULT_CONFIG,
	DEFAULT_SCENARIO,
	NAT_NETWORK,
	QUIET_SECONDS,
	RAMP_SECONDS,
	attackPrefix,
	attackScaleAt,
	buildFlows,
	buildWorldFlows,
	natPrefix,
} from './scenario';
import { SERVER_CELL, landCells } from './world';
import { createSim, type SimConfig } from './simulate';
import { prefixKey } from './ip';

function tickWith(policy: SimConfig['policy'], overrides: Partial<SimConfig> = {}) {
	const sim = createSim({ ...DEFAULT_CONFIG, ...overrides, policy }, buildFlows());
	sim.skipToFlood();
	return sim.tick();
}

function prefixOf(result: ReturnType<typeof tickWith>, network: number) {
	return result.prefixes.find((row) => row.network === network);
}

describe('default scenario', () => {
	it('puts legit users in many /24s, a NAT /24, and a botnet /24', () => {
		const flows = buildFlows();
		expect(flows.filter((f) => f.kind === 'good')).toHaveLength(
			DEFAULT_SCENARIO.scatteredGood + DEFAULT_SCENARIO.natGood,
		);
		expect(flows.filter((f) => f.kind === 'attack')).toHaveLength(DEFAULT_SCENARIO.bots);

		const prefixes = new Set(flows.map((f) => prefixKey(f.ip, 24)));
		expect(prefixes.size).toBe(DEFAULT_SCENARIO.scatteredGood + 2);
		expect(prefixes.has(natPrefix())).toBe(true);
		expect(prefixes.has(attackPrefix())).toBe(true);
	});
});

describe('the run', () => {
	it('starts quiet, then ramps the botnet', () => {
		expect(attackScaleAt(0)).toBe(0);
		expect(attackScaleAt(QUIET_SECONDS - 1)).toBe(0);
		expect(attackScaleAt(QUIET_SECONDS)).toBeCloseTo(1 / RAMP_SECONDS);
		expect(attackScaleAt(QUIET_SECONDS + RAMP_SECONDS - 1)).toBe(1);
	});

	it('lets all legit traffic through before the flood', () => {
		const sim = createSim({ ...DEFAULT_CONFIG, policy: 'open' }, buildFlows());
		const quiet = sim.tick();
		expect(quiet.t).toBe(0);
		expect(quiet.offeredAttack).toBe(0);
		expect(quiet.originAcceptGood).toBe(quiet.offeredGood);
		expect(quiet.originAcceptAttack).toBe(0);
		expect(quiet.clients.filter((c) => c.camp === 'scattered' && c.accepted > 0)).toHaveLength(40);
		expect(quiet.clients.filter((c) => c.camp === 'nat' && c.accepted > 0)).toHaveLength(25);
		expect(quiet.clients.filter((c) => c.camp === 'auto' && c.offered > 0)).toHaveLength(0);
	});

	it('lets a user-placed flood fire during the quiet window', () => {
		const cell = landCells().find(
			(c) => c.x !== SERVER_CELL.x || c.y !== SERVER_CELL.y,
		);
		expect(cell).toBeDefined();
		const sim = createSim(
			{ ...DEFAULT_CONFIG, policy: 'open' },
			buildWorldFlows({
				autoOn: true,
				userSources: [{ x: cell!.x, y: cell!.y, bots: 10, botRate: 5 }],
			}),
		);
		const quiet = sim.tick();
		expect(quiet.clients.filter((c) => c.camp === 'auto' && c.offered > 0)).toHaveLength(0);
		expect(quiet.clients.filter((c) => c.camp === 'user' && c.offered > 0).length).toBe(10);
		expect(quiet.originAcceptUser).toBeGreaterThan(0);
	});

	it('reaches the full flood after the ramp', () => {
		const sim = createSim({ ...DEFAULT_CONFIG, policy: 'open' }, buildFlows());
		sim.skipToFlood();
		const flood = sim.tick();
		expect(flood.attackScale).toBe(1);
		expect(flood.offeredAttack).toBe(800);
	});
});

describe('policies on the default scenario', () => {
	it('open: origin overloads and most good traffic dies with the flood', () => {
		const result = tickWith('open');
		expect(result.offeredGood).toBe(65);
		expect(result.offeredAttack).toBe(800);
		expect(result.originAcceptGood + result.originAcceptAttack).toBe(100);
		expect(result.originAcceptGood).toBe(8);
		expect(result.originAcceptAttack).toBe(92);
	});

	it('per-ip: each bot is clipped, but many polite bots still fill the origin', () => {
		const result = tickWith('per-ip');
		const nat = prefixOf(result, prefixKey(NAT_NETWORK, 24));
		expect(result.edgePassGood).toBe(65);
		expect(result.edgePassAttack).toBe(160);
		expect(result.originAcceptGood + result.originAcceptAttack).toBe(100);
		expect(result.originAcceptGood).toBe(29);
		expect(result.originAcceptAttack).toBe(71);
		expect(nat?.originAcceptGood).toBeGreaterThan(0);
		expect(nat?.originAcceptGood).toBeLessThan(25);
	});

	it('prefix-cap: origin lives, attack /24 is clipped, NAT /24 is clipped too', () => {
		const result = tickWith('prefix-cap');
		const nat = prefixOf(result, prefixKey(NAT_NETWORK, 24));
		const attack = prefixOf(result, prefixKey(ATTACK_NETWORK, 24));

		expect(result.originAcceptGood + result.originAcceptAttack).toBe(70);
		expect(result.originAcceptGood).toBe(55);
		expect(result.originAcceptAttack).toBe(15);
		expect(nat?.offeredGood).toBe(25);
		expect(nat?.originAcceptGood).toBe(15);
		expect(attack?.offeredAttack).toBe(800);
		expect(attack?.originAcceptAttack).toBe(15);
	});

	it('fair-share: scattered and NAT users get through; the botnet gets leftover capacity', () => {
		const result = tickWith('fair-share');
		const nat = prefixOf(result, prefixKey(NAT_NETWORK, 24));
		const attack = prefixOf(result, prefixKey(ATTACK_NETWORK, 24));

		expect(result.originAcceptGood).toBe(65);
		expect(result.originAcceptAttack).toBe(35);
		expect(result.originAcceptGood + result.originAcceptAttack).toBe(100);
		expect(nat?.originAcceptGood).toBe(25);
		expect(attack?.originAcceptAttack).toBe(35);
	});

	it('per-ip stays in steady state across ticks once the flood is on', () => {
		const sim = createSim({ ...DEFAULT_CONFIG, policy: 'per-ip' }, buildFlows());
		sim.skipToFlood();
		const first = sim.tick();
		const second = sim.tick();
		expect(second.edgePassAttack).toBe(first.edgePassAttack);
		expect(second.originAcceptGood).toBe(first.originAcceptGood);
	});
});
