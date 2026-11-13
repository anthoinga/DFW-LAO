import { error } from '@sveltejs/kit';
import type { Locale } from '#lib/config.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { vcard } from '#lib/card/vcard.ts';
import { loadCard } from '#lib/server/card.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const card = await loadCard(params.person ?? '', getLocale() as Locale);
	if (!card) error(404);
	const body = vcard({
		name: card.name,
		org: card.org,
		title: card.role,
		email: card.contact.email,
		phone: card.contact.phone,
		url: card.url,
		note: card.tagline,
		socials: card.socials.map((s) => s.href)
	});
	return new Response(body, {
		headers: {
			'content-type': 'text/vcard; charset=utf-8',
			'content-disposition': `attachment; filename="${card.id === 'org' ? 'dfw-lao-heritage' : card.id}.vcf"`,
			'cache-control': 'public, max-age=300'
		}
	});
};
