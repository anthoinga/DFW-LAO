import { defineArrayMember, defineField } from 'sanity';

/** Rich text used inside internationalized arrays (see sanity.config.ts). */
export const blockContentField = defineField({
	name: 'blockContent',
	type: 'array',
	of: [
		defineArrayMember({
			type: 'block',
			styles: [
				{ title: 'Normal', value: 'normal' },
				{ title: 'Heading 2', value: 'h2' },
				{ title: 'Heading 3', value: 'h3' },
				{ title: 'Quote', value: 'blockquote' }
			],
			marks: {
				annotations: [
					{
						name: 'link',
						type: 'object',
						title: 'Link',
						fields: [
							{
								name: 'href',
								type: 'url',
								validation: (r) =>
									r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
							}
						]
					}
				]
			}
		})
	]
});
