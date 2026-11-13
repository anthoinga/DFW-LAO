export const SITE_URL = 'https://www.dallasfwlaoheritage.com';
export const LINKS_HOST_PREFIX = 'links.';
export const LINKS_URL = 'https://links.dallasfwlaoheritage.com';
export const LOCALES = ['en', 'lo'] as const;
export type Locale = (typeof LOCALES)[number];
export const BASE_LOCALE: Locale = 'en';

/** Primary site routes, in nav/sitemap order. Every route also exists under /lo. */
export const ROUTES = [
	'/',
	'/camp',
	'/camp/register',
	'/help',
	'/help/request',
	'/events',
	'/about',
	'/support',
	'/contact',
	'/agent',
	'/privacy',
	'/terms'
] as const;

export const NAV = [
	{ href: '/camp', key: 'nav_camp' },
	{ href: '/help', key: 'nav_help' },
	{ href: '/events', key: 'nav_events' },
	{ href: '/about', key: 'nav_about' }
] as const;
