import { defineField, defineType } from 'sanity';

/** Written by the translation service; read-only for editors. */
export const i18nMeta = defineType({
	name: 'i18nMeta',
	title: 'Translation status',
	type: 'object',
	readOnly: ({ currentUser }) => !currentUser?.roles.some((r) => r.name === 'administrator'),
	options: { collapsible: true, collapsed: true },
	fields: [
		defineField({
			name: 'status',
			type: 'string',
			options: { list: ['pending', 'machine', 'reviewed', 'needs-review', 'error'] }
		}),
		defineField({ name: 'translatedAt', type: 'datetime' }),
		defineField({ name: 'forceAt', title: 'Re-translation requested at', type: 'datetime' }),
		defineField({
			name: 'hashes',
			title: 'Source hashes',
			description: 'Field path → hash of the English source last translated.',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'path', type: 'string' },
						{ name: 'hash', type: 'string' },
						{ name: 'reviewed', type: 'boolean' }
					]
				}
			]
		}),
		defineField({ name: 'error', type: 'string' })
	]
});
