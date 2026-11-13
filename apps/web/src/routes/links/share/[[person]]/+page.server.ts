import { error } from '@sveltejs/kit';
import type { Locale } from '#lib/config.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { qrSvg, trackedUrl } from '#lib/card/qr.ts';
import { loadCard } from '#lib/server/card.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const card = await loadCard(params.person ?? '', getLocale() as Locale);
	if (!card) error(404);
	const shareUrl = trackedUrl(card.url, 'qr', card.kind === 'person' ? card.id : undefined);
	return { card, shareUrl, qr: qrSvg(shareUrl) };
};
