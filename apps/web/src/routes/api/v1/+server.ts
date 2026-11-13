import { json } from '@sveltejs/kit';
import { SITE_URL } from '#lib/config.ts';
import { RESOURCES } from '#lib/agent/data.ts';
import type { RequestHandler } from './$types';

const CORS = { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=300' };

/** Index of the public, read-only JSON API. */
export const GET: RequestHandler = () =>
	json(
		{
			name: 'DFW Lao Heritage public API',
			version: 1,
			auth: 'none',
			languages: ['en', 'lo'],
			usage: 'Append ?lang=lo for Lao. All data is public; nothing here requires a key.',
			resources: Object.fromEntries(RESOURCES.map((r) => [r, `${SITE_URL}/api/v1/${r}`])),
			page: `${SITE_URL}/api/v1/page?path=/camp`,
			search: `${SITE_URL}/api/v1/search?q=summer+camp`,
			llms: `${SITE_URL}/llms.txt`,
			mcp: `${SITE_URL}/mcp`
		},
		{ headers: CORS }
	);
