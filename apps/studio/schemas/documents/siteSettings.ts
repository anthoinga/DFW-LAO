import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Site settings',
	type: 'document',
	fields: [
		defineField({ name: 'name', type: 'string', initialValue: 'DFW Lao Heritage' }),
		defineField({ name: 'tagline', type: 'internationalizedArrayString' }),
		defineField({ name: 'phone', type: 'string', initialValue: '682-331-7779' }),
		defineField({ name: 'email', type: 'string', initialValue: 'dfwlaoheritage@gmail.com' }),
		defineField({ name: 'address', type: 'text', rows: 3 }),
		defineField({ name: 'ein', title: 'EIN', type: 'string' }),
		defineField({ name: 'socials', type: 'array', of: [{ type: 'link' }] }),
		defineField({
			name: 'giving',
			type: 'object',
			fields: [
				defineField({ name: 'donorbox', type: 'url' }),
				defineField({ name: 'paypal', type: 'url' }),
				defineField({ name: 'venmo', type: 'string' }),
				defineField({ name: 'zelle', type: 'string' })
			]
		}),
		defineField({ name: 'ga4Id', title: 'GA4 measurement ID', type: 'string' }),
		defineField({ name: 'seo', title: 'Default SEO', type: 'seo' })
	],
	preview: { prepare: () => ({ title: 'Site settings' }) }
});
