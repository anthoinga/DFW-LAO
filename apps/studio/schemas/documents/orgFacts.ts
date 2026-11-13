import { defineField, defineType } from 'sanity';

/** Canonical, quotable facts used by JSON-LD, llms.txt, the JSON API, MCP and the chat. */
export const orgFacts = defineType({
	name: 'orgFacts',
	title: 'Organization facts',
	type: 'document',
	fields: [
		defineField({
			name: 'summary',
			type: 'internationalizedArrayText',
			validation: (r) => r.required()
		}),
		defineField({ name: 'mission', type: 'internationalizedArrayText' }),
		defineField({ name: 'foundedYear', type: 'number', initialValue: 2018 }),
		defineField({ name: 'nonprofitStatus', type: 'string', initialValue: '501(c)(3)' }),
		defineField({ name: 'serviceArea', type: 'internationalizedArrayString' }),
		defineField({
			name: 'facts',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'label', type: 'internationalizedArrayString' },
						{ name: 'value', type: 'internationalizedArrayString' }
					]
				}
			]
		}),
		defineField({ name: 'i18nMeta', type: 'i18nMeta' })
	],
	preview: { prepare: () => ({ title: 'Organization facts' }) }
});
