import { SITE_URL, type Locale } from '#lib/config.ts';
import { localePath, t } from '#lib/i18n/index.ts';
import { getCampSeason, getEvents, getFaqs, getSite, getTeam } from '#lib/sanity/content.ts';
import { allDocuments, documentFor } from './documents';

/**
 * Public, read-only data shared by the JSON API, the MCP server and the chat.
 * Never includes form submissions or personal contact details.
 */
export const publicData = {
	async org(locale: Locale) {
		const { settings, facts } = await getSite();
		return {
			name: settings.name,
			summary: t(facts.summary, locale),
			mission: t(facts.mission, locale),
			foundedYear: facts.foundedYear,
			nonprofitStatus: facts.nonprofitStatus,
			serviceArea: t(facts.serviceArea, locale),
			ein: settings.ein,
			phone: settings.phone,
			email: settings.email,
			website: SITE_URL,
			socials: settings.socials?.map((s) => s.href) ?? [],
			giving: settings.giving ?? {}
		};
	},

	async campSeason(locale: Locale) {
		const camp = await getCampSeason();
		if (!camp) return null;
		return {
			year: camp.year,
			startDate: camp.startDate,
			endDate: camp.endDate,
			hours: t(camp.hours, locale),
			venue: camp.venueName,
			address: camp.venueAddress,
			ages: camp.ageMin != null ? { min: camp.ageMin, max: camp.ageMax } : null,
			tuitionUsd: camp.tuitionUsd,
			sponsorAmountUsd: camp.sponsorAmountUsd,
			payment: t(camp.paymentNote, locale),
			registrationOpen: Boolean(camp.registrationOpen),
			registerUrl: SITE_URL + localePath('/camp/register', locale),
			curriculum: (camp.curriculum ?? []).map((c) => t(c, locale))
		};
	},

	async events(locale: Locale) {
		const now = new Date().toISOString();
		return (await getEvents()).map((e) => ({
			title: t(e.title, locale),
			startsAt: e.startsAt,
			endsAt: e.endsAt,
			venue: e.venueName,
			summary: t(e.summary, locale),
			status: (e.endsAt ?? e.startsAt) >= now ? 'upcoming' : 'past',
			url: SITE_URL + localePath(`/events/${e.slug.current}`, locale)
		}));
	},

	async team(locale: Locale) {
		return (await getTeam()).map((p) => ({
			name: p.name,
			role: t(p.role, locale),
			bio: t(p.shortBio, locale),
			url: SITE_URL + localePath(`/about/${p.slug.current}`, locale)
		}));
	},

	async faq(locale: Locale) {
		return (await getFaqs()).map((f) => ({
			topic: f.topic,
			question: t(f.question, locale),
			answer: t(f.answer, locale)
		}));
	},

	page: (path: string, locale: Locale) => documentFor(path, locale),

	async search(query: string, locale: Locale, limit = 5) {
		const terms = query
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 2);
		const docs = await allDocuments(locale);
		return docs
			.map((d) => {
				const text = d.markdown.toLowerCase();
				const score = terms.reduce((n, term) => n + (text.split(term).length - 1), 0);
				return { ...d, score };
			})
			.filter((d) => d.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map((d) => ({
				title: d.title,
				url: SITE_URL + localePath(d.path, locale),
				excerpt: d.markdown.slice(0, 600)
			}));
	}
};

export const RESOURCES = ['org', 'camp-season', 'events', 'team', 'faq'] as const;
