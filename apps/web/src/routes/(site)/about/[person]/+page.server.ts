import { error } from '@sveltejs/kit';
import { documentFor } from '#lib/agent/documents.ts';
import type { Locale } from '#lib/config.ts';
import { t } from '#lib/i18n/index.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { getPerson } from '#lib/sanity/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const locale = getLocale() as Locale;
	const path = `/about/${params.person}`;
	const [person, doc] = await Promise.all([getPerson(params.person), documentFor(path, locale)]);
	if (!person || !doc) error(404);
	return {
		person: { name: person.name, role: t(person.role, locale), slug: params.person },
		page: {
			path,
			title: doc.title,
			description: t(person.seo?.description, locale) ?? t(person.shortBio, locale),
			noindex: person.seo?.noindex ?? false,
			markdown: doc.markdown
		}
	};
};
