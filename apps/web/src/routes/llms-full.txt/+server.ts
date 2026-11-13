import type { Locale } from '#lib/config.ts';
import { llmsFullTxt } from '#lib/agent/llms.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	new Response(await llmsFullTxt(getLocale() as Locale), {
		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=900' }
	});
