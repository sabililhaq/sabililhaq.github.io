import { describe, expect, it } from 'vitest';
import {
	AUTO_CELLS,
	MAP_H,
	MAP_W,
	SERVER_CELL,
	cellKey,
	isLand,
	lonLatToCell,
	nearestLand,
} from './world';

describe('pixel world', () => {
	it('puts Jakarta, NYC, and London on land, and the mid-Atlantic in water', () => {
		expect(isLand(lonLatToCell(106.85, -6.2))).toBe(true);
		expect(isLand(lonLatToCell(-74, 41))).toBe(true);
		expect(isLand(lonLatToCell(0, 51))).toBe(true);
		expect(isLand(lonLatToCell(-30, 20))).toBe(false);
		expect(isLand(lonLatToCell(-150, 0))).toBe(false);
	});

	it('pins the origin on land in Indonesia', () => {
		expect(isLand(SERVER_CELL)).toBe(true);
		expect(SERVER_CELL.x).toBeGreaterThan(MAP_W / 2);
		expect(SERVER_CELL.y).toBeGreaterThan(MAP_H / 3);
	});

	it('snaps auto flood sites to distinct land cells, not the origin', () => {
		const keys = new Set(AUTO_CELLS.map(cellKey));
		expect(AUTO_CELLS.length).toBe(4);
		expect(keys.size).toBe(4);
		for (const cell of AUTO_CELLS) {
			expect(isLand(cell)).toBe(true);
			expect(cellKey(cell)).not.toBe(cellKey(SERVER_CELL));
		}
	});

	it('nearestLand is a no-op on land', () => {
		expect(nearestLand(SERVER_CELL)).toEqual(SERVER_CELL);
	});
});
