import { defineField, defineType } from 'sanity';

export const link = defineType({
	name: 'link',
	title: 'Link',
	type: 'object',
	fields: [
		defineField({
			name: 'label',
			type: 'internationalizedArrayString',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'href',
			type: 'url',
			validation: (r) =>
				r.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
		}),
		defineField({
			name: 'icon',
			type: 'string',
			options: {
				list: [
					'website',
					'camp',
					'donate',
					'help',
					'event',
					'facebook',
					'instagram',
					'youtube',
					'tiktok',
					'linkedin',
					'email',
					'phone'
				]
			}
		}),
		defineField({ name: 'startsAt', title: 'Show from', type: 'datetime' }),
		defineField({ name: 'endsAt', title: 'Show until', type: 'datetime' })
	],
	preview: { select: { title: 'href', subtitle: 'icon' } }
});
