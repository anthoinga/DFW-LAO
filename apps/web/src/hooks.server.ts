import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { deLocalizeUrl, extractLocaleFromUrl } from '#lib/paraglide/runtime.js';
import { LINKS_HOST_PREFIX, type Locale } from '#lib/config.ts';
import { resolveRedirect } from '#lib/server/redirects.ts';
import { getRedirectOverrides } from '#lib/sanity/content.ts';
import { documentFor } from '#lib/agent/documents.ts';

const isLinksHost = (url: URL) => url.hostname.startsWith(LINKS_HOST_PREFIX);

let overrides: { at: number; map: Record<string, string> } | undefined;
async function redirectOverrides() {
	if (!overrides || Date.now() - overrides.at > 5 * 60_000) {
		overrides = { at: Date.now(), map: await getRedirectOverrides().catch(() => ({})) };
	}
	return overrides.map;
}

/** Card routes are only reachable on the links host; legacy URLs 301 to their new home. */
const routing: Handle = async ({ event, resolve }) => {
	const { url } = event;
	if (!isLinksHost(url)) {
		if (url.pathname === '/links' || url.pathname.startsWith('/links/')) {
			return new Response('Not found', { status: 404 });
		}
		const target = resolveRedirect(url.pathname, await redirectOverrides());
		if (target) redirect(301, target);
	}
	return resolve(event);
};

/** `/camp.md`, `/lo/camp.md` or `Accept: text/markdown` → the page as Markdown. */
const markdown: Handle = async ({ event, resolve }) => {
	const { url, request } = event;
	if (isLinksHost(url)) return resolve(event);
	const wantsMd =
		url.pathname.endsWith('.md') || request.headers.get('accept')?.startsWith('text/markdown');
	if (!wantsMd) return resolve(event);

	const locale = (extractLocaleFromUrl(url) ?? 'en') as Locale;
	let path = deLocalizeUrl(url).pathname.replace(/\.md$/, '');
	if (path === '/index') path = '/';
	const doc = await documentFor(path || '/', locale);
	if (!doc) return resolve(event);
	return new Response(doc.markdown + '\n', {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			'cache-control': 'public, max-age=300',
			vary: 'accept'
		}
	});
};

const i18n: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) =>
					html
						.replace('%paraglide.lang%', locale)
						.replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

const headers: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const h = response.headers;
	h.set('x-content-type-options', 'nosniff');
	h.set('referrer-policy', 'strict-origin-when-cross-origin');
	h.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
	h.set('x-frame-options', 'SAMEORIGIN');
	const path = event.url.pathname;
	const personalCard = isLinksHost(event.url) && path !== '/' && path !== '/lo';
	if (path.startsWith('/admin') || path.startsWith('/api/') || personalCard) {
		h.set('x-robots-tag', 'noindex, nofollow');
	}
	return response;
};

export const handle: Handle = sequence(routing, markdown, i18n, headers);
