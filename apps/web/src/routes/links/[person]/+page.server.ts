import { error } from '@sveltejs/kit';
import type { Locale } from '#lib/config.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { appleWalletEnabled, googleWalletConfig, loadCard } from '#lib/server/card.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const card = await loadCard(params.person, getLocale() as Locale);
	if (!card) error(404);
	return {
		card,
		wallet: { google: Boolean(googleWalletConfig(url.origin)), apple: appleWalletEnabled() }
	};
};
