import { BASE_LOCALE, LOCALES, SITE_URL, type Locale } from '#lib/config.ts';

export type I18nValue<T = string> = { _key: string; value?: T }[] | null | undefined;

/** Pick a locale's value from a Sanity internationalized array, falling back to English. */
export function t<T = string>(field: I18nValue<T>, locale: Locale): T | undefined {
	if (!field?.length) return undefined;
	return (
		field.find((f) => f._key === locale)?.value ?? field.find((f) => f._key === BASE_LOCALE)?.value
	);
}

/** Path for a locale: English at root, Lao under /lo. */
export function localePath(path: string, locale: Locale): string {
	const clean = path === '/' ? '' : path;
	return locale === BASE_LOCALE ? clean || '/' : `/${locale}${clean}`;
}

export function alternates(path: string) {
	return [
		...LOCALES.map((l) => ({ hreflang: l, href: SITE_URL + localePath(path, l) })),
		{ hreflang: 'x-default', href: SITE_URL + localePath(path, BASE_LOCALE) }
	];
}

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}
