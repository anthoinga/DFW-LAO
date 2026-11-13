import type { RequestHandler } from './$types';

/** Installable card app, so admins can open their card instantly from the home screen. */
export const GET: RequestHandler = () =>
	new Response(
		JSON.stringify({
			name: 'DFW Lao Heritage',
			short_name: 'DFW Lao',
			start_url: '/',
			scope: '/',
			display: 'standalone',
			background_color: '#1f2a44',
			theme_color: '#1f2a44',
			icons: []
		}),
		{
			headers: {
				'content-type': 'application/manifest+json',
				'cache-control': 'public, max-age=86400'
			}
		}
	);
