import { describe, expect, it } from 'vitest';
import { maxMinFair, splitInteger } from './split';

describe('splitInteger', () => {
	it('returns zeros for empty or empty-weight input', () => {
		expect(splitInteger([], 10)).toEqual([]);
		expect(splitInteger([1, 2], 0)).toEqual([0, 0]);
		expect(splitInteger([0, 0], 10)).toEqual([0, 0]);
	});

	it('preserves the total with the largest remainder method', () => {
		expect(splitInteger([1, 1, 1], 10)).toEqual([4, 3, 3]);
		expect(splitInteger([65, 800], 100)).toEqual([8, 92]);
		expect(splitInteger([65, 160], 100)).toEqual([29, 71]);
	});
});

describe('maxMinFair', () => {
	it('gives everyone their demand when capacity is plenty', () => {
		expect(maxMinFair([5, 5], 100)).toEqual([5, 5]);
	});

	it('splits equally when everyone is hungry', () => {
		expect(maxMinFair([10, 10, 10], 15)).toEqual([5, 5, 5]);
	});

	it('fills small demands first and dumps leftover on the flood', () => {
		expect(maxMinFair([1, 1, 25, 800], 100)).toEqual([1, 1, 25, 73]);
	});

	it('returns zeros when there is no capacity', () => {
		expect(maxMinFair([10, 20], 0)).toEqual([0, 0]);
		expect(maxMinFair([], 10)).toEqual([]);
	});
});
