import { defineField, defineType } from 'sanity';

/** Low-sensitivity submissions, stored in the private `submissions` dataset. Read-only in Studio. */
const base = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
	defineType({
		name,
		title,
		type: 'document',
		readOnly: true,
		fields: [
			...fields,
			defineField({ name: 'locale', type: 'string' }),
			defineField({ name: 'receivedAt', type: 'datetime' })
		],
		orderings: [
			{ title: 'Newest', name: 'newest', by: [{ field: 'receivedAt', direction: 'desc' }] }
		],
		preview: { select: { title: 'email', subtitle: 'receivedAt' } }
	});

export const inboxTypes = [
	base('contactMessage', 'Contact message', [
		defineField({ name: 'name', type: 'string' }),
		defineField({ name: 'email', type: 'string' }),
		defineField({ name: 'subject', type: 'string' }),
		defineField({ name: 'message', type: 'text' })
	]),
	base('volunteerInterest', 'Volunteer interest', [
		defineField({ name: 'name', type: 'string' }),
		defineField({ name: 'email', type: 'string' }),
		defineField({ name: 'interests', type: 'array', of: [{ type: 'string' }] }),
		defineField({ name: 'message', type: 'text' })
	]),
	base('newsletterSubscriber', 'Newsletter subscriber', [
		defineField({ name: 'name', type: 'string' }),
		defineField({ name: 'email', type: 'string' })
	])
];
