import { defineField } from 'sanity';

export const titleField = defineField({
	name: 'title',
	type: 'internationalizedArrayString',
	validation: (r) => r.required()
});

export const slugField = (source = 'title') =>
	defineField({
		name: 'slug',
		type: 'slug',
		description: 'English URL segment. Shared by the Lao version.',
		options: {
			source: (doc: Record<string, unknown>) => {
				const value = doc[source] as { _key: string; value?: string }[] | undefined;
				return value?.find((v) => v._key === 'en')?.value ?? '';
			}
		},
		validation: (r) => r.required()
	});

export const seoField = defineField({ name: 'seo', type: 'seo', group: 'seo' });
export const i18nMetaField = defineField({ name: 'i18nMeta', type: 'i18nMeta', group: 'seo' });

export const groups = [
	{ name: 'content', title: 'Content', default: true },
	{ name: 'seo', title: 'SEO & translation' }
];

export const enTitle = (title?: { _key: string; value?: string }[]) =>
	title?.find((t) => t._key === 'en')?.value ?? 'Untitled';
