import type { BreadcrumbList, Event, NGO, Person, WithContext } from 'schema-dts';
import { SITE_URL, type Locale } from '#lib/config.ts';
import { localePath, t } from '#lib/i18n/index.ts';
import type { EventSummary, SiteData } from '#lib/sanity/content.ts';

export function organization(site: SiteData, locale: Locale): WithContext<NGO> {
	const { settings, facts } = site;
	return {
		'@context': 'https://schema.org',
		'@type': 'NGO',
		'@id': `${SITE_URL}/#organization`,
		name: settings.name,
		url: SITE_URL,
		description: t(facts.summary, locale),
		email: settings.email,
		telephone: settings.phone,
		foundingDate: facts.foundedYear ? String(facts.foundedYear) : undefined,
		nonprofitStatus: 'Nonprofit501c3',
		taxID: settings.ein,
		areaServed: t(facts.serviceArea, locale),
		sameAs: settings.socials?.map((s) => s.href)
	};
}

export function event(e: EventSummary, locale: Locale): WithContext<Event> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: t(e.title, locale) ?? '',
		startDate: e.startsAt,
		endDate: e.endsAt,
		description: t(e.summary, locale),
		url: SITE_URL + localePath(`/events/${e.slug.current}`, locale),
		location: e.venueName ? { '@type': 'Place', name: e.venueName } : undefined,
		organizer: { '@id': `${SITE_URL}/#organization` }
	};
}

export function person(
	name: string,
	role: string | undefined,
	slug: string,
	locale: Locale
): WithContext<Person> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name,
		jobTitle: role,
		url: SITE_URL + localePath(`/about/${slug}`, locale),
		worksFor: { '@id': `${SITE_URL}/#organization` }
	};
}

export function breadcrumbs(
	items: { name: string; path: string }[],
	locale: Locale
): WithContext<BreadcrumbList> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: SITE_URL + localePath(item.path, locale)
		}))
	};
}

/** Safe for embedding in a <script type="application/ld+json"> tag. */
export const serialize = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export const jsonLdTag = (data: unknown) =>
	`<script type="application/ld+json">${serialize(data)}<` + `/script>`;
