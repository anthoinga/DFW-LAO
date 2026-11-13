import { error } from '@sveltejs/kit';
import { documentFor } from '#lib/agent/documents.ts';
import type { Locale } from '#lib/config.ts';
import { t } from '#lib/i18n/index.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { getEvent } from '#lib/sanity/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const locale = getLocale() as Locale;
	const path = `/events/${params.slug}`;
	const [event, doc] = await Promise.all([getEvent(params.slug), documentFor(path, locale)]);
	if (!event || !doc) error(404);
	return {
		event,
		page: {
			path,
			title: doc.title,
			description: t(event.seo?.description, locale) ?? t(event.summary, locale),
			noindex: event.seo?.noindex ?? false,
			markdown: doc.markdown
		}
	};
};
