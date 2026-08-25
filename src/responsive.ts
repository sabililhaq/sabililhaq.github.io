/** Routes that are not mobile-ready yet. Narrow viewports get the desktop toast. */
export const DESKTOP_ONLY = ['/map', '/vim'] as const;

export const DESKTOP_MIN_WIDTH = 768;

export const DESKTOP_TOAST_MS = 3000;

export function normalizePathname(pathname: string): string {
	const noQuery = (pathname.split(/[?#]/)[0] ?? '/').trim() || '/';
	const withSlash = noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
	if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
	return withSlash;
}

export function isDesktopOnly(pathname: string): boolean {
	const path = normalizePathname(pathname);
	return DESKTOP_ONLY.some((route) => path === route || path.startsWith(`${route}/`));
}

export function shouldShowDesktopToast(pathname: string, viewportWidth: number): boolean {
	if (viewportWidth >= DESKTOP_MIN_WIDTH) return false;
	return isDesktopOnly(pathname);
}
