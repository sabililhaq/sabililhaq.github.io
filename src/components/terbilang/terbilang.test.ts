import { describe, expect, it } from 'vitest';
import {
	formatId,
	integerToWords,
	parseNumberInput,
	sentenceCase,
	toTerbilang,
	type ParsedNumber,
} from './terbilang';

function parsed(integer: bigint | number, fraction = '', negative = false): ParsedNumber {
	return { integer: BigInt(integer), fraction, negative };
}

describe('integerToWords', () => {
	it('reads the small and irregular forms', () => {
		expect(integerToWords(0n)).toBe('nol');
		expect(integerToWords(1n)).toBe('satu');
		expect(integerToWords(10n)).toBe('sepuluh');
		expect(integerToWords(11n)).toBe('sebelas');
		expect(integerToWords(12n)).toBe('dua belas');
		expect(integerToWords(19n)).toBe('sembilan belas');
		expect(integerToWords(20n)).toBe('dua puluh');
		expect(integerToWords(21n)).toBe('dua puluh satu');
		expect(integerToWords(99n)).toBe('sembilan puluh sembilan');
	});

	it('uses se- only for seratus and seribu', () => {
		expect(integerToWords(100n)).toBe('seratus');
		expect(integerToWords(101n)).toBe('seratus satu');
		expect(integerToWords(110n)).toBe('seratus sepuluh');
		expect(integerToWords(111n)).toBe('seratus sebelas');
		expect(integerToWords(200n)).toBe('dua ratus');
		expect(integerToWords(1000n)).toBe('seribu');
		expect(integerToWords(1001n)).toBe('seribu satu');
		expect(integerToWords(1100n)).toBe('seribu seratus');
		expect(integerToWords(2000n)).toBe('dua ribu');
		expect(integerToWords(1_000_000n)).toBe('satu juta');
		expect(integerToWords(1_001_000n)).toBe('satu juta seribu');
	});

	it('splits larger numbers into named scales', () => {
		expect(integerToWords(15_000n)).toBe('lima belas ribu');
		expect(integerToWords(1_250_000n)).toBe('satu juta dua ratus lima puluh ribu');
		expect(integerToWords(1_234_567n)).toBe(
			'satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh',
		);
		expect(integerToWords(1_000_000_000n)).toBe('satu miliar');
		expect(integerToWords(1_000_000_000_000n)).toBe('satu triliun');
		expect(integerToWords(1945n)).toBe('seribu sembilan ratus empat puluh lima');
	});

	it('prefixes negatives with minus', () => {
		expect(integerToWords(-15n)).toBe('minus lima belas');
	});
});

describe('parseNumberInput', () => {
	it('treats blank input as empty, not invalid', () => {
		expect(parseNumberInput('')).toEqual({ ok: false, reason: 'empty' });
		expect(parseNumberInput('   ')).toEqual({ ok: false, reason: 'empty' });
	});

	it('accepts plain digits, underscores, and a leading plus', () => {
		expect(parseNumberInput('1250000')).toEqual({
			ok: true,
			value: parsed(1_250_000n),
		});
		expect(parseNumberInput('1_250_000')).toEqual({
			ok: true,
			value: parsed(1_250_000n),
		});
		expect(parseNumberInput('+11')).toEqual({ ok: true, value: parsed(11n) });
	});

	it('reads Indonesian grouping and US grouping', () => {
		expect(parseNumberInput('1.250.000')).toEqual({
			ok: true,
			value: parsed(1_250_000n),
		});
		expect(parseNumberInput('1,250,000')).toEqual({
			ok: true,
			value: parsed(1_250_000n),
		});
		expect(parseNumberInput('1.250')).toEqual({ ok: true, value: parsed(1250n) });
		expect(parseNumberInput('1,250')).toEqual({ ok: true, value: parsed(1250n) });
	});

	it('treats a 1–2 digit tail as a decimal, including 0,5 and .5', () => {
		expect(parseNumberInput('1.5')).toEqual({
			ok: true,
			value: parsed(1n, '5'),
		});
		expect(parseNumberInput('1,25')).toEqual({
			ok: true,
			value: parsed(1n, '25'),
		});
		expect(parseNumberInput('0.5')).toEqual({
			ok: true,
			value: parsed(0n, '5'),
		});
		expect(parseNumberInput('.5')).toEqual({
			ok: true,
			value: parsed(0n, '5'),
		});
		expect(parseNumberInput('0.500')).toEqual({
			ok: true,
			value: parsed(0n, '500'),
		});
	});

	it('reads mixed thousand and decimal separators', () => {
		expect(parseNumberInput('1.250.000,50')).toEqual({
			ok: true,
			value: parsed(1_250_000n, '50'),
		});
		expect(parseNumberInput('1,250,000.50')).toEqual({
			ok: true,
			value: parsed(1_250_000n, '50'),
		});
	});

	it('strips rupiah prefixes and signed zeros', () => {
		expect(parseNumberInput('Rp 1.250.000')).toEqual({
			ok: true,
			value: parsed(1_250_000n),
		});
		expect(parseNumberInput('rp.15000')).toEqual({
			ok: true,
			value: parsed(15_000n),
		});
		expect(parseNumberInput('IDR 11')).toEqual({ ok: true, value: parsed(11n) });
		expect(parseNumberInput('-0')).toEqual({ ok: true, value: parsed(0n) });
		expect(parseNumberInput('-15')).toEqual({
			ok: true,
			value: parsed(15n, '', true),
		});
	});

	it('rejects junk and numbers past sekstiliun', () => {
		expect(parseNumberInput('abc')).toEqual({ ok: false, reason: 'invalid' });
		expect(parseNumberInput('10.0.1.3')).toEqual({ ok: false, reason: 'invalid' });
		expect(parseNumberInput('1..000')).toEqual({ ok: false, reason: 'invalid' });
		expect(parseNumberInput('1' + '0'.repeat(24))).toEqual({
			ok: false,
			reason: 'too-large',
		});
	});
});

describe('toTerbilang', () => {
	it('reads decimals digit by digit after koma', () => {
		expect(toTerbilang(parsed(1n, '05'))).toBe('satu koma nol lima');
		expect(toTerbilang(parsed(125n, '5'))).toBe('seratus dua puluh lima koma lima');
	});

	it('appends rupiah and sen, rounding half up to cents', () => {
		expect(toTerbilang(parsed(15_000n), { rupiah: true })).toBe('lima belas ribu rupiah');
		expect(toTerbilang(parsed(15_000n, '5'), { rupiah: true })).toBe(
			'lima belas ribu rupiah lima puluh sen',
		);
		expect(toTerbilang(parsed(1n, '994'), { rupiah: true })).toBe(
			'satu rupiah sembilan puluh sembilan sen',
		);
		expect(toTerbilang(parsed(1n, '995'), { rupiah: true })).toBe('dua rupiah');
		expect(toTerbilang(parsed(0n, '50'), { rupiah: true })).toBe('nol rupiah lima puluh sen');
	});

	it('keeps minus in front of the whole reading', () => {
		expect(toTerbilang(parsed(15n, '', true))).toBe('minus lima belas');
		expect(toTerbilang(parsed(15n, '', true), { rupiah: true })).toBe('minus lima belas rupiah');
	});
});

describe('formatId', () => {
	it('groups with dots and uses a comma for the fraction', () => {
		expect(formatId(parsed(1_250_000n))).toBe('1.250.000');
		expect(formatId(parsed(1_250_000n, '50'))).toBe('1.250.000,50');
		expect(formatId(parsed(15n, '', true))).toBe('-15');
	});

	it('formats rupiah with an Rp prefix and two-digit sen', () => {
		expect(formatId(parsed(1_250_000n), { rupiah: true })).toBe('Rp 1.250.000');
		expect(formatId(parsed(1_250_000n, '5'), { rupiah: true })).toBe('Rp 1.250.000,50');
		expect(formatId(parsed(15n, '', true), { rupiah: true })).toBe('-Rp 15');
	});
});

describe('sentenceCase', () => {
	it('capitalizes the first letter only', () => {
		expect(sentenceCase('satu juta dua ratus lima puluh ribu')).toBe(
			'Satu juta dua ratus lima puluh ribu',
		);
		expect(sentenceCase('')).toBe('');
	});
});
