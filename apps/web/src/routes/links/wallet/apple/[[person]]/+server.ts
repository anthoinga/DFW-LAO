import { error } from '@sveltejs/kit';
import { appleWalletEnabled } from '#lib/server/card.ts';
import type { RequestHandler } from './$types';

/**
 * Apple Wallet .pkpass. Disabled until the Apple Developer account, Pass Type ID certificate and
 * WWDR certificate are configured (see context/roadmap.md, phase 6).
 */
export const GET: RequestHandler = () => {
	if (!appleWalletEnabled()) error(404, 'Apple Wallet is not enabled yet');
	error(501, 'Apple Wallet signing is not configured');
};
