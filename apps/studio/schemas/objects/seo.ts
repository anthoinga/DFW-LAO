import { defineField, defineType } from 'sanity';

export const seo = defineType({
	name: 'seo',
	title: 'SEO',
	type: 'object',
	options: { collapsible: true, collapsed: true },
	fields: [
		defineField({
			name: 'title',
			title: 'Meta title',
			type: 'internationalizedArrayString',
			description: 'Aim for 30–60 characters. Falls back to the page title.'
		}),
		defineField({
			name: 'description',
			title: 'Meta description',
			type: 'internationalizedArrayText',
			description: 'Aim for 70–160 characters.'
		}),
		defineField({ name: 'ogImage', title: 'Social share image', type: 'accessibleImage' }),
		defineField({ name: 'canonical', title: 'Canonical URL override', type: 'url' }),
		defineField({
			name: 'noindex',
			title: 'Hide from search engines',
			type: 'boolean',
			initialValue: false
		})
	]
});
