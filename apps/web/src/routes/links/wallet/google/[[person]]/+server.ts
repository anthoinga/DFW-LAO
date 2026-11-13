import { error, redirect } from '@sveltejs/kit';
import { googleWalletJwt } from '#lib/card/google-wallet.ts';
import { googleWalletConfig, loadCard } from '#lib/server/card.ts';
import type { RequestHandler } from './$types';

/** Redirects to Google's "Save to Google Wallet" page with a signed pass JWT. */
export const GET: RequestHandler = async ({ params, url }) => {
	const config = googleWalletConfig(url.origin);
	if (!config) error(404, 'Google Wallet is not configured');
	const card = await loadCard(params.person ?? '', 'en');
	if (!card) error(404);
	const jwt = await googleWalletJwt(config, {
		id: card.id,
		name: card.name,
		title: card.role,
		org: card.org,
		url: card.url
	});
	redirect(302, `https://pay.google.com/gp/v/save/${jwt}`);
};
