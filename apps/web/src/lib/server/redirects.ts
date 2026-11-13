/**
 * Legacy site URLs → new routes. Single source of truth for the launch redirects;
 * editors can add overrides as `redirect` documents in the CMS.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
	'/home': '/',
	'/about-us': '/about',
	'/our-team': '/about',
	'/kelly-phommachanh': '/about/kelly-phommachanh',
	'/prinston-pan': '/about/prinston-pan',
	'/registration': '/camp/register',
	'/registration-form': '/camp/register',
	'/laos-music-instruments': '/camp',
	'/sponsor-a-student': '/support#sponsor',
	'/support-us': '/support',
	'/social-services-assistance': '/help',
	'/food-pantry-information': '/help',
	'/copy-of-contact': '/contact',
	'/past-events': '/events',
	'/dfw': '/events/2019-cultural-show',
	'/flood': '/events/2019-laos-flood-relief-concert',
	'/copy-of-terms-of-use': '/privacy',
	'/terms-of-use': '/terms',
	'/fullscreen-page': '/',
	'/account/my-account': '/',
	'/account/my-wallet': '/',
	'/account/my-addresses': '/'
};

export function resolveRedirect(
	pathname: string,
	overrides: Record<string, string> = {}
): string | undefined {
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
	const key = path.toLowerCase();
	return overrides[key] ?? LEGACY_REDIRECTS[key] ?? (key.startsWith('/account/') ? '/' : undefined);
}
