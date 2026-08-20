const ONES = [
	'',
	'satu',
	'dua',
	'tiga',
	'empat',
	'lima',
	'enam',
	'tujuh',
	'delapan',
	'sembilan',
] as const;

const DIGITS = ['nol', ...ONES.slice(1)] as const;

const SCALES = [
	'',
	'ribu',
	'juta',
	'miliar',
	'triliun',
	'kuadriliun',
	'kuintiliun',
	'sekstiliun',
] as const;

const MAX_INTEGER_DIGITS = SCALES.length * 3;

export type ParsedNumber = {
	negative: boolean;
	integer: bigint;
	fraction: string;
};

export type ParseResult =
	| { ok: true; value: ParsedNumber }
	| { ok: false; reason: 'empty' | 'invalid' | 'too-large' };

export type TerbilangOptions = {
	rupiah?: boolean;
};

function say0to999(n: number): string {
	if (n <= 0 || n >= 1000) return '';

	const parts: string[] = [];
	const hundreds = Math.floor(n / 100);
	const rest = n % 100;

	if (hundreds === 1) parts.push('seratus');
	else if (hundreds > 1) parts.push(`${ONES[hundreds]} ratus`);

	if (rest === 0) {
		// nothing
	} else if (rest === 10) {
		parts.push('sepuluh');
	} else if (rest === 11) {
		parts.push('sebelas');
	} else if (rest < 10) {
		parts.push(ONES[rest]!);
	} else if (rest < 20) {
		parts.push(`${ONES[rest - 10]} belas`);
	} else {
		const tens = Math.floor(rest / 10);
		const ones = rest % 10;
		parts.push(`${ONES[tens]} puluh`);
		if (ones) parts.push(ONES[ones]!);
	}

	return parts.join(' ');
}

export function integerToWords(n: bigint): string {
	if (n === 0n) return 'nol';
	if (n < 0n) return `minus ${integerToWords(-n)}`;

	const groups: number[] = [];
	let remaining = n;
	while (remaining > 0n) {
		groups.push(Number(remaining % 1000n));
		remaining /= 1000n;
	}

	if (groups.length > SCALES.length) {
		throw new RangeError('Number is too large');
	}

	const parts: string[] = [];
	for (let i = groups.length - 1; i >= 0; i--) {
		const group = groups[i]!;
		if (group === 0) continue;
		if (i === 1 && group === 1) {
			parts.push('seribu');
			continue;
		}
		const words = say0to999(group);
		const scale = SCALES[i];
		parts.push(scale ? `${words} ${scale}` : words);
	}

	return parts.join(' ');
}

function isThousandGrouped(parts: string[]): boolean {
	if (parts.length < 2) return false;
	const head = parts[0]!;
	if (!/^[1-9]\d{0,2}$/.test(head)) return false;
	return parts.slice(1).every((part) => /^\d{3}$/.test(part));
}

function parseGroupedInteger(s: string, thousandSep: '.' | ','): bigint | null {
	const parts = s.split(thousandSep);
	if (!isThousandGrouped(parts) && !(parts.length === 1 && /^\d+$/.test(s))) {
		return null;
	}
	const digits = parts.join('');
	if (!/^\d+$/.test(digits)) return null;
	return BigInt(digits);
}

function parseUnsigned(s: string): { integer: bigint; fraction: string } | null {
	if (s === '' || s === '.' || s === ',') return null;
	if (!/^[\d.,]+$/.test(s)) return null;
	if (s.includes('..') || s.includes(',,') || s.includes('.,') || s.includes(',.')) {
		return null;
	}

	const hasDot = s.includes('.');
	const hasComma = s.includes(',');

	if (hasDot && hasComma) {
		const lastDot = s.lastIndexOf('.');
		const lastComma = s.lastIndexOf(',');
		const decimalIsComma = lastComma > lastDot;
		const decimalSep = decimalIsComma ? ',' : '.';
		const thousandSep = decimalIsComma ? '.' : ',';
		const cut = decimalIsComma ? lastComma : lastDot;
		const intRaw = s.slice(0, cut);
		const fraction = s.slice(cut + 1);
		if (!/^\d+$/.test(fraction) || fraction.length === 0) return null;
		if (intRaw.includes(decimalSep)) return null;
		const integer =
			intRaw === ''
				? 0n
				: intRaw.includes(thousandSep)
					? parseGroupedInteger(intRaw, thousandSep)
					: /^\d+$/.test(intRaw)
						? BigInt(intRaw)
						: null;
		if (integer === null) return null;
		return { integer, fraction };
	}

	const sep: '.' | ',' | null = hasDot ? '.' : hasComma ? ',' : null;
	if (!sep) {
		if (!/^\d+$/.test(s)) return null;
		return { integer: BigInt(s), fraction: '' };
	}

	const parts = s.split(sep);
	if (parts.some((part) => part === '')) return null;

	if (isThousandGrouped(parts)) {
		return { integer: BigInt(parts.join('')), fraction: '' };
	}

	if (parts.length !== 2) return null;
	const [intRaw, fraction] = parts;
	if (!/^\d+$/.test(intRaw!) || !/^\d+$/.test(fraction!)) return null;

	if (fraction!.length === 3 && /^[1-9]\d{0,2}$/.test(intRaw!)) {
		return { integer: BigInt(intRaw! + fraction!), fraction: '' };
	}

	return { integer: BigInt(intRaw!), fraction: fraction! };
}

export function parseNumberInput(raw: string): ParseResult {
	let s = raw.trim();
	if (s === '') return { ok: false, reason: 'empty' };

	s = s.replace(/[\s_]/g, '');
	s = s.replace(/^(?:rp\.?|idr)/i, '');
	s = s.replace(/[\s_]/g, '');

	let negative = false;
	if (s.startsWith('-') || s.startsWith('−')) {
		negative = true;
		s = s.slice(1);
	} else if (s.startsWith('+')) {
		s = s.slice(1);
	}

	if (s.startsWith('.' ) || s.startsWith(',')) {
		s = `0${s}`;
	}

	const parsed = parseUnsigned(s);
	if (!parsed) return { ok: false, reason: 'invalid' };

	if (parsed.integer === 0n && parsed.fraction.replace(/0/g, '') === '') {
		negative = false;
	}

	const integerDigits = parsed.integer.toString().length;
	if (parsed.integer > 0n && integerDigits > MAX_INTEGER_DIGITS) {
		return { ok: false, reason: 'too-large' };
	}

	return {
		ok: true,
		value: {
			negative,
			integer: parsed.integer,
			fraction: parsed.fraction,
		},
	};
}

function fractionToCents(fraction: string): { extraInteger: bigint; cents: number } {
	if (!fraction) return { extraInteger: 0n, cents: 0 };
	const thousandths = Number((fraction + '000').slice(0, 3));
	if (!Number.isFinite(thousandths)) return { extraInteger: 0n, cents: 0 };
	const rounded = Math.round(thousandths / 10);
	if (rounded === 100) return { extraInteger: 1n, cents: 0 };
	return { extraInteger: 0n, cents: rounded };
}

function digitsToWords(digits: string): string {
	return [...digits].map((digit) => DIGITS[Number(digit)]!).join(' ');
}

export function toTerbilang(parsed: ParsedNumber, options: TerbilangOptions = {}): string {
	const sign = parsed.negative ? 'minus ' : '';

	if (options.rupiah) {
		const { extraInteger, cents } = fractionToCents(parsed.fraction);
		let integer = parsed.integer + extraInteger;
		let negative = parsed.negative;
		if (integer === 0n && cents === 0) negative = false;
		const prefix = negative ? 'minus ' : '';
		const words = `${integerToWords(integer)} rupiah`;
		if (cents === 0) return `${prefix}${words}`;
		return `${prefix}${words} ${integerToWords(BigInt(cents))} sen`;
	}

	const head = integerToWords(parsed.integer);
	if (!parsed.fraction) return `${sign}${head}`;
	return `${sign}${head} koma ${digitsToWords(parsed.fraction)}`;
}

export function formatId(parsed: ParsedNumber, options: TerbilangOptions = {}): string {
	const { extraInteger, cents } = options.rupiah
		? fractionToCents(parsed.fraction)
		: { extraInteger: 0n, cents: 0 };

	let integer = parsed.integer + extraInteger;
	let negative = parsed.negative;
	if (options.rupiah && integer === 0n && cents === 0) negative = false;

	const grouped = integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	const sign = negative ? '-' : '';

	if (options.rupiah) {
		const money = cents > 0 ? `${grouped},${cents.toString().padStart(2, '0')}` : grouped;
		return `${sign}Rp ${money}`;
	}

	if (!parsed.fraction) return `${sign}${grouped}`;
	return `${sign}${grouped},${parsed.fraction}`;
}

export function sentenceCase(words: string): string {
	if (!words) return words;
	return words.charAt(0).toUpperCase() + words.slice(1);
}
