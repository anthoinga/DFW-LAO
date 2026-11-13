import { defineField, defineType } from 'sanity';

export const i18nGlossary = defineType({
	name: 'i18nGlossary',
	title: 'Translation glossary',
	type: 'document',
	fields: [
		defineField({
			name: 'styleNotes',
			type: 'text',
			rows: 4,
			initialValue:
				'Respectful, plain Lao readable by elders. Keep numbers, dates, URLs, emails and phone numbers unchanged.'
		}),
		defineField({
			name: 'terms',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'en', title: 'English', type: 'string' },
						{ name: 'lo', title: 'Lao (leave empty to keep as-is)', type: 'string' },
						{ name: 'note', type: 'string' }
					],
					preview: { select: { title: 'en', subtitle: 'lo' } }
				}
			],
			initialValue: [
				{ _key: 'org', en: 'DFW Lao Heritage', lo: '', note: 'Keep in Latin script' },
				{ _key: 'baci', en: 'Baci', lo: 'ບາສີ' }
			]
		})
	],
	preview: { prepare: () => ({ title: 'Translation glossary' }) }
});
