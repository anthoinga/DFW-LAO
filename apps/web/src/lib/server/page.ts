import { documentFor } from '#lib/agent/documents.ts';
import type { Locale } from '#lib/config.ts';
import { t } from '#lib/i18n/index.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { getPage } from '#lib/sanity/content.ts';

/** Shared loader for CMS-driven route pages. Body is rendered from the same Markdown agents see. */
export async function loadRoutePage(path: string) {
	const locale = getLocale() as Locale;
	const key = path === '/' ? 'home' : path.slice(1);
	const [page, doc] = await Promise.all([getPage(key), documentFor(path, locale)]);
	return {
		path,
		title: doc?.title ?? key,
		description: t(page?.seo?.description, locale) ?? t(page?.intro, locale),
		noindex: page?.seo?.noindex ?? false,
		markdown: doc?.markdown ?? ''
	};
}
