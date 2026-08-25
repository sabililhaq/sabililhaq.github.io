import { describe, expect, it } from 'vitest';
import { parseProximityJson, serializeProximity } from './io';

const paris = { name: 'Paris', lat: 48.8566, lon: 2.3522 };
const london = { name: 'London', lat: 51.5074, lon: -0.1278 };

describe('serializeProximity', () => {
	it('writes destination and location nodes with lat/lon', () => {
		const json = serializeProximity({ destination: paris, locations: [london] });
		expect(JSON.parse(json)).toEqual({
			destination: paris,
			locations: [london],
		});
	});
});

describe('parseProximityJson', () => {
	it('reads the canonical export shape', () => {
		const result = parseProximityJson(
			JSON.stringify({ destination: paris, locations: [london] }),
		);
		expect(result).toEqual({
			ok: true,
			data: { destination: paris, locations: [london] },
		});
	});

	it('accepts lng/long aliases and a nodes list', () => {
		const result = parseProximityJson(
			JSON.stringify({
				nodes: [
					{ name: 'Paris', lat: 48.8566, lng: 2.3522, role: 'destination' },
					{ name: 'London', latitude: 51.5074, long: -0.1278 },
				],
			}),
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.destination).toEqual(paris);
			expect(result.data.locations).toEqual([london]);
		}
	});

	it('treats the first array node as the destination', () => {
		const result = parseProximityJson(JSON.stringify([paris, london]));
		expect(result).toEqual({
			ok: true,
			data: { destination: paris, locations: [london] },
		});
	});

	it('rejects missing coordinates and invalid JSON', () => {
		expect(parseProximityJson('not json').ok).toBe(false);
		expect(parseProximityJson(JSON.stringify({ locations: [{ name: 'x' }] })).ok).toBe(false);
		expect(parseProximityJson(JSON.stringify({ destination: { name: 'x', lat: 99, lon: 0 } })).ok).toBe(
			false,
		);
	});
});
