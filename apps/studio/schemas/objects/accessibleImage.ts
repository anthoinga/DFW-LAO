import { defineField, defineType } from 'sanity';

export const accessibleImage = defineType({
	name: 'accessibleImage',
	title: 'Image',
	type: 'image',
	options: { hotspot: true },
	fields: [
		defineField({
			name: 'alt',
			title: 'Alternative text',
			type: 'internationalizedArrayString',
			description: 'Describe the image for screen readers and search. Required unless decorative.'
		}),
		defineField({ name: 'decorative', type: 'boolean', initialValue: false })
	]
});
