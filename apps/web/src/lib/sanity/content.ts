import type { I18nValue } from '#lib/i18n/index.ts';
import { fetchOr } from './client';
import {
	CAMP_QUERY,
	CARD_QUERY,
	EVENT_QUERY,
	EVENTS_QUERY,
	FAQ_QUERY,
	PAGE_QUERY,
	PERSON_QUERY,
	REDIRECTS_QUERY,
	SITE_QUERY,
	TEAM_QUERY
} from './queries';

const en = (value: string): I18nValue => [{ _key: 'en', value }];

export type Link = {
	label?: I18nValue;
	href: string;
	icon?: string;
	startsAt?: string;
	endsAt?: string;
};
export type Seo = {
	title?: I18nValue;
	description?: I18nValue;
	noindex?: boolean;
	canonical?: string;
};

export type SiteData = {
	settings: {
		name: string;
		tagline?: I18nValue;
		phone?: string;
		email?: string;
		address?: string;
		ein?: string;
		socials?: Link[];
		giving?: { donorbox?: string; paypal?: string; venmo?: string; zelle?: string };
		ga4Id?: string;
		seo?: Seo;
	};
	facts: {
		summary?: I18nValue;
		mission?: I18nValue;
		foundedYear?: number;
		nonprofitStatus?: string;
		serviceArea?: I18nValue;
	};
};

/** Used until the CMS is connected, and as a safety net if it is unreachable. */
export const FALLBACK_SITE: SiteData = {
	settings: {
		name: 'DFW Lao Heritage',
		tagline: en('Lao arts, culture and community in Dallas–Fort Worth'),
		phone: '682-331-7779',
		email: 'dfwlaoheritage@gmail.com',
		socials: [
			{ href: 'https://www.facebook.com/DFWlaoheritage', icon: 'facebook', label: en('Facebook') },
			{
				href: 'https://www.instagram.com/dfwlaoheritage',
				icon: 'instagram',
				label: en('Instagram')
			},
			{
				href: 'https://www.youtube.com/channel/UC2qgGmOltOYsZNM217rGICw',
				icon: 'youtube',
				label: en('YouTube')
			}
		],
		giving: {
			donorbox: 'https://donorbox.org/dfwlaoheritage',
			paypal: 'https://paypal.me/dfwlaoheritage',
			venmo: '@dfwlaoheritage',
			zelle: 'dfwlaoheritage@gmail.com'
		}
	},
	facts: {
		summary: en(
			'DFW Lao Heritage is a volunteer-run 501(c)(3) nonprofit in Dallas–Fort Worth that preserves Lao arts and culture through a youth summer camp and connects refugee, immigrant and underserved families with social services.'
		),
		foundedYear: 2018,
		nonprofitStatus: '501(c)(3)',
		serviceArea: en('Dallas–Fort Worth, Texas')
	}
};

export const getSite = () =>
	fetchOr<SiteData>(SITE_QUERY, {}, FALLBACK_SITE).then((d) => ({
		settings: { ...FALLBACK_SITE.settings, ...(d.settings ?? {}) },
		facts: { ...FALLBACK_SITE.facts, ...(d.facts ?? {}) }
	}));

export type PageDoc = {
	title?: I18nValue;
	intro?: I18nValue;
	sections?: unknown[];
	seo?: Seo;
	_updatedAt?: string;
};
export const getPage = (route: string) => fetchOr<PageDoc | null>(PAGE_QUERY, { route }, null);

export type CampSeason = {
	year: number;
	startDate: string;
	endDate: string;
	showcaseDate?: string;
	hours?: I18nValue;
	venueName?: string;
	venueAddress?: string;
	ageMin?: number;
	ageMax?: number;
	tuitionUsd?: number;
	sponsorAmountUsd?: number;
	paymentNote?: I18nValue;
	registrationOpen?: boolean;
	curriculum?: I18nValue[];
};
export const getCampSeason = () => fetchOr<CampSeason | null>(CAMP_QUERY, {}, null);

export type EventSummary = {
	_id: string;
	title?: I18nValue;
	slug: { current: string };
	startsAt: string;
	endsAt?: string;
	venueName?: string;
	summary?: I18nValue;
};
export const getEvents = () => fetchOr<EventSummary[]>(EVENTS_QUERY, {}, []);
export const getEvent = (slug: string) =>
	fetchOr<(EventSummary & { body?: I18nValue<unknown[]>; seo?: Seo }) | null>(
		EVENT_QUERY,
		{ slug },
		null
	);

export type Person = {
	_id: string;
	name: string;
	slug: { current: string };
	role?: I18nValue;
	shortBio?: I18nValue;
};
export const getTeam = () => fetchOr<Person[]>(TEAM_QUERY, {}, []);
export const getPerson = (slug: string) =>
	fetchOr<(Person & { body?: I18nValue<unknown[]>; socials?: Link[]; seo?: Seo }) | null>(
		PERSON_QUERY,
		{ slug },
		null
	);

export type Faq = { _id: string; question?: I18nValue; answer?: I18nValue; topic?: string };
export const getFaqs = () => fetchOr<Faq[]>(FAQ_QUERY, {}, []);

export type LinkCard = {
	kind: 'org' | 'person';
	name: string;
	slug?: { current: string };
	role?: I18nValue;
	tagline?: I18nValue;
	featuredLinks?: Link[];
	personalContact?: { optIn?: boolean; email?: string; phone?: string };
};
export const getLinkCard = (slug: string) => fetchOr<LinkCard | null>(CARD_QUERY, { slug }, null);

export const getRedirectOverrides = async () => {
	const docs = await fetchOr<{ from: string; to: string }[]>(REDIRECTS_QUERY, {}, []);
	return Object.fromEntries(docs.map((r) => [r.from.toLowerCase(), r.to]));
};

/** Links whose schedule includes `now`. */
export const activeLinks = (links: Link[] = [], now = new Date()) =>
	links.filter(
		(l) => (!l.startsAt || new Date(l.startsAt) <= now) && (!l.endsAt || new Date(l.endsAt) >= now)
	);
