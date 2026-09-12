export const MAP_W = 96;
export const MAP_H = 48;

export type Cell = { x: number; y: number };

function clamp(n: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, n));
}

export function lonLatToCell(lon: number, lat: number): Cell {
	const x = Math.round(((lon + 180) / 360) * (MAP_W - 1));
	const y = Math.round(((90 - lat) / 180) * (MAP_H - 1));
	return { x: clamp(x, 0, MAP_W - 1), y: clamp(y, 0, MAP_H - 1) };
}

export function cellToLonLat(cell: Cell): { lon: number; lat: number } {
	const lon = (cell.x / (MAP_W - 1)) * 360 - 180;
	const lat = 90 - (cell.y / (MAP_H - 1)) * 180;
	return { lon, lat };
}

export function cellKey(cell: Cell): string {
	return `${cell.x},${cell.y}`;
}

function fillEllipse(
	land: Uint8Array,
	lon: number,
	lat: number,
	rLon: number,
	rLat: number,
): void {
	for (let y = 0; y < MAP_H; y++) {
		for (let x = 0; x < MAP_W; x++) {
			const p = cellToLonLat({ x, y });
			const dx = (p.lon - lon) / rLon;
			const dy = (p.lat - lat) / rLat;
			if (dx * dx + dy * dy <= 1) land[y * MAP_W + x] = 1;
		}
	}
}

function buildLand(): Uint8Array {
	const land = new Uint8Array(MAP_W * MAP_H);
	fillEllipse(land, -100, 48, 42, 28);
	fillEllipse(land, -90, 20, 18, 10);
	fillEllipse(land, -62, -18, 22, 32);
	fillEllipse(land, -42, 72, 16, 10);
	fillEllipse(land, 12, 52, 22, 14);
	fillEllipse(land, -3, 54, 8, 7);
	fillEllipse(land, 20, 2, 28, 36);
	fillEllipse(land, 47, 24, 14, 12);
	fillEllipse(land, 88, 48, 52, 28);
	fillEllipse(land, 78, 22, 14, 16);
	fillEllipse(land, 115, 8, 22, 14);
	fillEllipse(land, 120, -4, 26, 12);
	fillEllipse(land, 138, 37, 8, 10);
	fillEllipse(land, 134, -25, 22, 14);
	fillEllipse(land, 47, -19, 6, 10);
	return land;
}

export const LAND = buildLand();

export function isLand(cell: Cell): boolean {
	if (cell.x < 0 || cell.y < 0 || cell.x >= MAP_W || cell.y >= MAP_H) return false;
	return LAND[cell.y * MAP_W + cell.x] === 1;
}

export function nearestLand(cell: Cell): Cell {
	if (isLand(cell)) return cell;
	let best: Cell = cell;
	let bestD = Infinity;
	for (let y = 0; y < MAP_H; y++) {
		for (let x = 0; x < MAP_W; x++) {
			if (LAND[y * MAP_W + x] !== 1) continue;
			const d = (x - cell.x) ** 2 + (y - cell.y) ** 2;
			if (d < bestD) {
				bestD = d;
				best = { x, y };
			}
		}
	}
	return best;
}

/** Origin sits in Jakarta. */
export const SERVER_CELL: Cell = nearestLand(lonLatToCell(106.85, -6.2));

const AUTO_PRESETS: { lon: number; lat: number }[] = [
	{ lon: -74, lat: 41 },
	{ lon: 0, lat: 51 },
	{ lon: 121, lat: 31 },
	{ lon: -47, lat: -23 },
];

export const AUTO_CELLS: Cell[] = AUTO_PRESETS.map((p) => nearestLand(lonLatToCell(p.lon, p.lat)));

export function landCells(): Cell[] {
	const cells: Cell[] = [];
	for (let y = 0; y < MAP_H; y++) {
		for (let x = 0; x < MAP_W; x++) {
			if (LAND[y * MAP_W + x] === 1) cells.push({ x, y });
		}
	}
	return cells;
}

export function formatCell(cell: Cell): string {
	const { lon, lat } = cellToLonLat(cell);
	const lonH = lon >= 0 ? 'E' : 'W';
	const latH = lat >= 0 ? 'N' : 'S';
	return `${Math.abs(lat).toFixed(0)}°${latH} ${Math.abs(lon).toFixed(0)}°${lonH}`;
}
