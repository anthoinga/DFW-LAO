import { error, json } from '@sveltejs/kit';
import { isLocale } from '#lib/i18n/index.ts';
import { publicData } from '#lib/agent/data.ts';
import type { RequestHandler } from './$types';

const CORS = { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300' };

export const GET: RequestHandler = async ({ params, url }) => {
	const lang = url.searchParams.get('lang') ?? 'en';
	const locale = isLocale(lang) ? lang : 'en';
	let data: unknown;
	switch (params.resource) {
		case 'org':
			data = await publicData.org(locale);
			break;
		case 'camp-season':
			data = await publicData.campSeason(locale);
			break;
		case 'events':
			data = await publicData.events(locale);
			break;
		case 'team':
			data = await publicData.team(locale);
			break;
		case 'faq':
			data = await publicData.faq(locale);
			break;
		case 'page':
			data = await publicData.page(url.searchParams.get('path') ?? '/', locale);
			break;
		case 'search':
			data = await publicData.search(url.searchParams.get('q') ?? '', locale);
			break;
		default:
			error(404, 'Unknown resource');
	}
	if (data == null) error(404, 'Not found');
	return json(data, { headers: CORS });
};

export const OPTIONS: RequestHandler = () =>
	new Response(null, { headers: { ...CORS, 'access-control-allow-methods': 'GET, OPTIONS' } });
