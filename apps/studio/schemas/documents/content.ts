import { defineArrayMember, defineField, defineType } from 'sanity';
import { enTitle, groups, i18nMetaField, seoField, slugField, titleField } from './shared';

const body = defineField({
	name: 'body',
	type: 'internationalizedArrayBlockContent',
	group: 'content'
});

/** Generic page built from sections (home, about, help, support, contact, agent, legal). */
export const page = defineType({
	name: 'page',
	title: 'Page',
	type: 'document',
	groups,
	fields: [
		titleField,
		defineField({
			name: 'route',
			type: 'string',
			description: 'Which site route this page powers.',
			options: {
				list: [
					'home',
					'camp',
					'help',
					'events',
					'about',
					'support',
					'contact',
					'agent',
					'privacy',
					'terms'
				]
			},
			validation: (r) => r.required()
		}),
		defineField({ name: 'intro', type: 'internationalizedArrayText', group: 'content' }),
		defineField({
			name: 'sections',
			type: 'array',
			group: 'content',
			of: [
				defineArrayMember({
					name: 'textSection',
					type: 'object',
					fields: [
						defineField({ name: 'heading', type: 'internationalizedArrayString' }),
						defineField({ name: 'anchor', type: 'string' }),
						body,
						defineField({ name: 'image', type: 'accessibleImage' })
					],
					preview: { select: { t: 'heading' }, prepare: ({ t }) => ({ title: enTitle(t) }) }
				}),
				defineArrayMember({
					name: 'ctaSection',
					type: 'object',
					fields: [
						defineField({ name: 'heading', type: 'internationalizedArrayString' }),
						defineField({ name: 'anchor', type: 'string' }),
						defineField({ name: 'text', type: 'internationalizedArrayText' }),
						defineField({ name: 'links', type: 'array', of: [{ type: 'link' }] })
					],
					preview: {
						select: { t: 'heading' },
						prepare: ({ t }) => ({ title: enTitle(t), subtitle: 'Call to action' })
					}
				}),
				defineArrayMember({
					name: 'gallerySection',
					type: 'object',
					fields: [
						defineField({ name: 'heading', type: 'internationalizedArrayString' }),
						defineField({ name: 'images', type: 'array', of: [{ type: 'accessibleImage' }] })
					],
					preview: {
						select: { t: 'heading' },
						prepare: ({ t }) => ({ title: enTitle(t), subtitle: 'Gallery' })
					}
				}),
				defineArrayMember({
					name: 'faqSection',
					type: 'object',
					fields: [
						defineField({ name: 'heading', type: 'internationalizedArrayString' }),
						defineField({
							name: 'items',
							type: 'array',
							of: [{ type: 'reference', to: [{ type: 'faq' }] }]
						})
					],
					preview: {
						select: { t: 'heading' },
						prepare: ({ t }) => ({ title: enTitle(t), subtitle: 'FAQ' })
					}
				})
			]
		}),
		seoField,
		i18nMetaField
	],
	preview: {
		select: { t: 'title', route: 'route' },
		prepare: ({ t, route }) => ({
			title: enTitle(t),
			subtitle: `/${route === 'home' ? '' : route}`
		})
	}
});

export const campSeason = defineType({
	name: 'campSeason',
	title: 'Camp season',
	type: 'document',
	groups,
	fields: [
		defineField({
			name: 'year',
			type: 'number',
			validation: (r) => r.required().integer().min(2018)
		}),
		defineField({ name: 'startDate', type: 'date', validation: (r) => r.required() }),
		defineField({ name: 'endDate', type: 'date', validation: (r) => r.required() }),
		defineField({ name: 'showcaseDate', type: 'datetime' }),
		defineField({ name: 'hours', type: 'internationalizedArrayString' }),
		defineField({ name: 'venueName', type: 'string' }),
		defineField({ name: 'venueAddress', type: 'text', rows: 2 }),
		defineField({ name: 'ageMin', type: 'number', initialValue: 6 }),
		defineField({ name: 'ageMax', type: 'number', initialValue: 18 }),
		defineField({ name: 'tuitionUsd', type: 'number' }),
		defineField({ name: 'sponsorAmountUsd', type: 'number' }),
		defineField({
			name: 'paymentNote',
			type: 'internationalizedArrayText',
			description: 'e.g. Pay by check or cash on the first day of camp.'
		}),
		defineField({ name: 'registrationOpen', type: 'boolean', initialValue: false }),
		defineField({ name: 'capacity', type: 'number' }),
		defineField({
			name: 'curriculum',
			type: 'array',
			of: [{ type: 'internationalizedArrayString' }]
		}),
		defineField({
			name: 'instruments',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'name', type: 'internationalizedArrayString' },
						{ name: 'description', type: 'internationalizedArrayText' },
						{ name: 'image', type: 'accessibleImage' }
					],
					preview: { select: { t: 'name' }, prepare: ({ t }) => ({ title: enTitle(t) }) }
				}
			]
		}),
		i18nMetaField
	],
	orderings: [{ title: 'Year', name: 'year', by: [{ field: 'year', direction: 'desc' }] }],
	preview: {
		select: { year: 'year', open: 'registrationOpen' },
		prepare: ({ year, open }) => ({
			title: `Camp ${year ?? ''}`,
			subtitle: open ? 'Registration open' : 'Registration closed'
		})
	}
});

export const event = defineType({
	name: 'event',
	title: 'Event',
	type: 'document',
	groups,
	fields: [
		titleField,
		slugField(),
		defineField({ name: 'startsAt', type: 'datetime', validation: (r) => r.required() }),
		defineField({ name: 'endsAt', type: 'datetime' }),
		defineField({ name: 'venueName', type: 'string' }),
		defineField({ name: 'venueAddress', type: 'text', rows: 2 }),
		defineField({ name: 'summary', type: 'internationalizedArrayText' }),
		body,
		defineField({ name: 'heroImage', type: 'accessibleImage' }),
		defineField({ name: 'gallery', type: 'array', of: [{ type: 'accessibleImage' }] }),
		defineField({ name: 'videos', title: 'YouTube URLs', type: 'array', of: [{ type: 'url' }] }),
		defineField({ name: 'links', type: 'array', of: [{ type: 'link' }] }),
		seoField,
		i18nMetaField
	],
	orderings: [{ title: 'Date', name: 'date', by: [{ field: 'startsAt', direction: 'desc' }] }],
	preview: {
		select: { t: 'title', d: 'startsAt' },
		prepare: ({ t, d }) => ({ title: enTitle(t), subtitle: d?.slice(0, 10) })
	}
});

export const teamMember = defineType({
	name: 'teamMember',
	title: 'Team member',
	type: 'document',
	groups,
	fields: [
		defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			options: { source: 'name' },
			validation: (r) => r.required()
		}),
		defineField({ name: 'role', type: 'internationalizedArrayString' }),
		defineField({ name: 'order', type: 'number' }),
		defineField({ name: 'photo', type: 'accessibleImage' }),
		defineField({ name: 'shortBio', type: 'internationalizedArrayText' }),
		body,
		defineField({ name: 'socials', type: 'array', of: [{ type: 'link' }] }),
		seoField,
		i18nMetaField
	],
	orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'name', r: 'role', media: 'photo' },
		prepare: ({ title, r, media }) => ({ title, subtitle: enTitle(r), media })
	}
});

export const faq = defineType({
	name: 'faq',
	title: 'FAQ',
	type: 'document',
	groups,
	fields: [
		defineField({
			name: 'question',
			type: 'internationalizedArrayString',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'answer',
			type: 'internationalizedArrayText',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'topic',
			type: 'string',
			options: { list: ['camp', 'help', 'support', 'about', 'general'] }
		}),
		i18nMetaField
	],
	preview: {
		select: { q: 'question', topic: 'topic' },
		prepare: ({ q, topic }) => ({ title: enTitle(q), subtitle: topic })
	}
});

export const redirect = defineType({
	name: 'redirect',
	title: 'Redirect',
	type: 'document',
	fields: [
		defineField({
			name: 'from',
			type: 'string',
			description: 'Path, e.g. /old-page',
			validation: (r) => r.required().regex(/^\//)
		}),
		defineField({
			name: 'to',
			type: 'string',
			description: 'Path or full URL',
			validation: (r) => r.required()
		}),
		defineField({ name: 'permanent', type: 'boolean', initialValue: true })
	],
	preview: { select: { title: 'from', subtitle: 'to' } }
});

export const linkCard = defineType({
	name: 'linkCard',
	title: 'Digital card',
	type: 'document',
	groups,
	fields: [
		defineField({
			name: 'kind',
			type: 'string',
			options: { list: ['org', 'person'], layout: 'radio' },
			initialValue: 'person',
			validation: (r) => r.required()
		}),
		defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			description: 'Card URL: links.dallasfwlaoheritage.com/<slug> (org card uses the root).',
			options: { source: 'name' },
			hidden: ({ document }) => document?.kind === 'org',
			validation: (r) =>
				r.custom((v, ctx) =>
					ctx.document?.kind === 'person' && !v?.current ? 'Required for personal cards' : true
				)
		}),
		defineField({
			name: 'person',
			type: 'reference',
			to: [{ type: 'teamMember' }],
			hidden: ({ document }) => document?.kind === 'org'
		}),
		defineField({ name: 'role', type: 'internationalizedArrayString' }),
		defineField({ name: 'tagline', type: 'internationalizedArrayString' }),
		defineField({ name: 'photo', type: 'accessibleImage' }),
		defineField({
			name: 'featuredLinks',
			type: 'array',
			of: [{ type: 'link' }],
			validation: (r) => r.max(6)
		}),
		defineField({
			name: 'personalContact',
			title: 'Personal contact (opt-in)',
			description: 'Shown only on this card and its saved contact. Never on the main site.',
			type: 'object',
			hidden: ({ document }) => document?.kind === 'org',
			fields: [
				defineField({
					name: 'optIn',
					title: 'I agree to share this on my card',
					type: 'boolean',
					initialValue: false
				}),
				defineField({ name: 'email', type: 'string', hidden: ({ parent }) => !parent?.optIn }),
				defineField({ name: 'phone', type: 'string', hidden: ({ parent }) => !parent?.optIn })
			]
		}),
		i18nMetaField
	],
	preview: {
		select: { title: 'name', kind: 'kind', slug: 'slug.current' },
		prepare: ({ title, kind, slug }) => ({
			title,
			subtitle: kind === 'org' ? 'links.…/' : `links.…/${slug ?? ''}`
		})
	}
});
