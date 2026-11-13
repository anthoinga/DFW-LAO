import type { Reroute } from '@sveltejs/kit/hooks';
import { deLocalizeUrl } from '#lib/paraglide/runtime.js';
import { LINKS_HOST_PREFIX } from '#lib/config.ts';

const SHARED = new Set(['/robots.txt']);

/**
 * - `links.` host → the digital card routes under /links.
 * - `/lo/...` → the same route, with Lao as the active locale.
 */
export const reroute: Reroute = ({ url }) => {
	const { pathname } = deLocalizeUrl(url);
	if (url.hostname.startsWith(LINKS_HOST_PREFIX) && !SHARED.has(pathname)) {
		return `/links${pathname === '/' ? '' : pathname}`;
	}
	return pathname;
};
