import { SITE_URL, type Locale } from '#lib/config.ts';
import { localePath, t, type I18nValue } from '#lib/i18n/index.ts';
import {
	getCampSeason,
	getEvent,
	getEvents,
	getPage,
	getPerson,
	getSite,
	getTeam,
	type PageDoc
} from '#lib/sanity/content.ts';
import { toMarkdown } from './portable-text';

export type SiteDocument = { path: string; title: string; markdown: string };

export const PUBLIC_ROUTES = [
	'/',
	'/camp',
	'/help',
	'/events',
	'/about',
	'/support',
	'/contact',
	'/agent',
	'/privacy',
	'/terms'
];

const ROUTE_TITLES: Record<string, string> = {
	'/': 'DFW Lao Heritage',
	'/camp': 'Lao Arts & Culture Summer Camp',
	'/help': 'Community Help',
	'/events': 'Events',
	'/about': 'About',
	'/support': 'Support',
	'/contact': 'Contact',
	'/agent': 'For AI assistants',
	'/privacy': 'Privacy Policy',
	'/terms': 'Terms of Use'
};

type RawSection = {
	_type: string;
	heading?: I18nValue;
	text?: I18nValue;
	body?: I18nValue<unknown[]>;
	items?: { question?: I18nValue; answer?: I18nValue }[];
};

function sectionsToMarkdown(page: PageDoc | null, locale: Locale): string {
	const parts: string[] = [];
	for (const section of (page?.sections ?? []) as RawSection[]) {
		const heading = t(section.heading, locale);
		if (heading) parts.push(`## ${heading}`);
		if (section.body) parts.push(toMarkdown(t(section.body, locale)));
		if (section.text) parts.push(t(section.text, locale) ?? '');
		if (section._type === 'faqSection') {
			for (const item of section.items ?? []) {
				parts.push(`### ${t(item.question, locale) ?? ''}\n\n${t(item.answer, locale) ?? ''}`);
			}
		}
	}
	return parts.filter(Boolean).join('\n\n');
}

const list = (lines: (string | false | null | undefined)[]) => lines.filter(Boolean).join('\n');

async function routeDocument(route: string, locale: Locale): Promise<SiteDocument> {
	const key = route === '/' ? 'home' : route.slice(1);
	const [page, site] = await Promise.all([getPage(key), getSite()]);
	const title = t(page?.title, locale) ?? ROUTE_TITLES[route] ?? route;
	const body: string[] = [t(page?.intro, locale) ?? ''];

	if (route === '/' || route === '/about') body.push(t(site.facts.summary, locale) ?? '');

	if (route === '/camp') {
		const camp = await getCampSeason();
		if (camp) {
			body.push(
				list([
					`## Camp ${camp.year}`,
					`- Dates: ${camp.startDate} to ${camp.endDate}`,
					camp.hours && `- Hours: ${t(camp.hours, locale)}`,
					camp.venueName &&
						`- Location: ${camp.venueName}${camp.venueAddress ? `, ${camp.venueAddress}` : ''}`,
					camp.ageMin != null && `- Ages: ${camp.ageMin}–${camp.ageMax}`,
					camp.tuitionUsd != null && `- Tuition: $${camp.tuitionUsd}`,
					`- Registration: ${camp.registrationOpen ? 'open' : 'closed'}`,
					...(camp.curriculum ?? []).map((c) => `- ${t(c, locale)}`)
				])
			);
		}
	}

	if (route === '/events') {
		const events = await getEvents();
		body.push(
			events
				.map(
					(e) =>
						`- [${t(e.title, locale)}](${SITE_URL}${localePath(`/events/${e.slug.current}`, locale)}) — ${e.startsAt.slice(0, 10)}`
				)
				.join('\n')
		);
	}

	if (route === '/about') {
		const team = await getTeam();
		body.push(team.map((p) => `- **${p.name}** — ${t(p.role, locale) ?? ''}`).join('\n'));
	}

	if (route === '/support') {
		const g = site.settings.giving ?? {};
		body.push(
			list([
				`DFW Lao Heritage is a ${site.facts.nonprofitStatus} nonprofit; donations are tax-deductible.`,
				g.donorbox && `- Donate online: ${g.donorbox}`,
				g.paypal && `- PayPal: ${g.paypal}`,
				g.venmo && `- Venmo: ${g.venmo}`,
				g.zelle && `- Zelle: ${g.zelle}`
			])
		);
	}

	if (route === '/contact') {
		body.push(list([`- Phone: ${site.settings.phone}`, `- Email: ${site.settings.email}`]));
	}

	body.push(sectionsToMarkdown(page, locale));
	return {
		path: route,
		title,
		markdown: `# ${title}\n\n${body.filter(Boolean).join('\n\n')}`.trim()
	};
}

/** Markdown for one public path, or null if the path has no document. */
export async function documentFor(path: string, locale: Locale): Promise<SiteDocument | null> {
	if (PUBLIC_ROUTES.includes(path)) return routeDocument(path, locale);

	const event = path.match(/^\/events\/([\w-]+)$/);
	if (event) {
		const e = await getEvent(event[1]);
		if (!e) return null;
		const title = t(e.title, locale) ?? event[1];
		const meta = list([
			`- Date: ${e.startsAt.slice(0, 10)}`,
			e.venueName && `- Venue: ${e.venueName}`
		]);
		const text = [meta, t(e.summary, locale), toMarkdown(t(e.body, locale))].filter(Boolean);
		return { path, title, markdown: `# ${title}\n\n${text.join('\n\n')}` };
	}

	const person = path.match(/^\/about\/([\w-]+)$/);
	if (person) {
		const p = await getPerson(person[1]);
		if (!p) return null;
		const bio = toMarkdown(t(p.body, locale)) || t(p.shortBio, locale) || '';
		const text = [t(p.role, locale), bio].filter(Boolean);
		return { path, title: p.name, markdown: `# ${p.name}\n\n${text.join('\n\n')}` };
	}

	return null;
}

/** Every public document in one locale (llms-full.txt, chat corpus, search). */
export async function allDocuments(locale: Locale): Promise<SiteDocument[]> {
	const [events, team] = await Promise.all([getEvents(), getTeam()]);
	const paths = [
		...PUBLIC_ROUTES,
		...events.map((e) => `/events/${e.slug.current}`),
		...team.map((p) => `/about/${p.slug.current}`)
	];
	const docs = await Promise.all(paths.map((p) => documentFor(p, locale)));
	return docs.filter((d): d is SiteDocument => Boolean(d));
}
