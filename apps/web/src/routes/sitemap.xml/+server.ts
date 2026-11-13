import { LINKS_URL, LOCALES, SITE_URL } from '#lib/config.ts';
import { localePath } from '#lib/i18n/index.ts';
import { PUBLIC_ROUTES } from '#lib/agent/documents.ts';
import { fetchOr } from '#lib/sanity/client.ts';
import { SITEMAP_QUERY } from '#lib/sanity/queries.ts';
import type { RequestHandler } from './$types';

type Entry = { path: string; lastmod?: string };
type SitemapData = {
	pages: { route: string; _updatedAt: string }[];
	events: { slug: string; _updatedAt: string }[];
	team: { slug: string; _updatedAt: string }[];
};

const HIDDEN = new Set(['/agent']);

function urlEntry({ path, lastmod }: Entry) {
	const links = [...LOCALES, 'x-default' as const]
		.map((l) => {
			const href = SITE_URL + localePath(path, l === 'x-default' ? 'en' : l);
			return `<xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`;
		})
		.join('');
	return LOCALES.map(
		(l) =>
			`<url><loc>${SITE_URL + localePath(path, l)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}${links}</url>`
	).join('');
}

export const GET: RequestHandler = async () => {
	const data = await fetchOr<SitemapData>(SITEMAP_QUERY, {}, { pages: [], events: [], team: [] });
	const updated = Object.fromEntries(
		data.pages.map((p) => [p.route === 'home' ? '/' : `/${p.route}`, p._updatedAt])
	);
	const entries: Entry[] = [
		...PUBLIC_ROUTES.filter((p) => !HIDDEN.has(p)).map((path) => ({
			path,
			lastmod: updated[path]
		})),
		{ path: '/camp/register' },
		{ path: '/help/request' },
		...data.events.map((e) => ({ path: `/events/${e.slug}`, lastmod: e._updatedAt })),
		...data.team.map((p) => ({ path: `/about/${p.slug}`, lastmod: p._updatedAt }))
	];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.map(urlEntry).join('')}<url><loc>${LINKS_URL}/</loc></url></urlset>`;
	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
