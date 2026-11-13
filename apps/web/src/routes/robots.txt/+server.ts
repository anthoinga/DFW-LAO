import { SITE_URL } from '#lib/config.ts';
import type { RequestHandler } from './$types';

/** AI search and answer engines are explicitly welcome; private areas are not crawlable. */
const AI_CRAWLERS = [
	'OAI-SearchBot',
	'ChatGPT-User',
	'GPTBot',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended'
];

const DISALLOW = ['/admin', '/api/chat', '/api/i18n', '/mcp'];

export const GET: RequestHandler = ({ url }) => {
	if (url.hostname.startsWith('links.')) {
		return new Response('User-agent: *\nAllow: /$\nDisallow: /\n', {
			headers: { 'content-type': 'text/plain' }
		});
	}
	const block = DISALLOW.map((p) => `Disallow: ${p}`).join('\n');
	const body = [
		`User-agent: *\nAllow: /\n${block}`,
		...AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /\n${block}`),
		`Sitemap: ${SITE_URL}/sitemap.xml`
	].join('\n\n');
	return new Response(body + '\n', {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
