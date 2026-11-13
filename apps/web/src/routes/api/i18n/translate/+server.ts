import { error, json } from '@sveltejs/kit';
import { sanityWriter } from '#lib/sanity/client.ts';
import { env } from '#lib/server/env.ts';
import { verifySanityWebhook } from '#lib/server/security.ts';
import { claudeTranslator } from '#lib/server/translate/claude.ts';
import { planTranslation, type Glossary } from '#lib/server/translate/pipeline.ts';
import type { RequestHandler } from './$types';

const TRANSLATABLE = new Set([
	'page',
	'campSeason',
	'event',
	'teamMember',
	'faq',
	'linkCard',
	'orgFacts'
]);

/**
 * Sanity webhook (on publish of translatable types, projection `{_id, _type}`).
 * Fetches the published document, translates changed English fields to Lao and writes them back.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const valid = await verifySanityWebhook(
		body,
		request.headers.get('sanity-webhook-signature'),
		env.SANITY_WEBHOOK_SECRET
	);
	if (!valid) error(401, 'Invalid signature');

	const { _id, _type } = JSON.parse(body) as { _id?: string; _type?: string };
	if (!_id || !_type || !TRANSLATABLE.has(_type) || _id.startsWith('drafts.'))
		return json({ skipped: true });

	const apiKey = env.ANTHROPIC_API_KEY;
	const client = sanityWriter();
	if (!apiKey || !client) error(503, 'Translation is not configured');

	const [doc, glossary] = await Promise.all([
		client.getDocument(_id),
		client.fetch<Glossary | null>(`*[_id == "i18nGlossary"][0]{ styleNotes, terms }`)
	]);
	if (!doc) return json({ skipped: true });

	try {
		const plan = await planTranslation(doc, claudeTranslator(apiKey), glossary ?? {});
		if (!plan) return json({ translated: 0 });
		await client.patch(_id).set(plan.set).commit({ autoGenerateArrayKeys: true });
		return json({ translated: plan.translated, skipped: plan.skipped });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Translation failed';
		await client
			.patch(_id)
			.set({ 'i18nMeta.status': 'error', 'i18nMeta.error': message })
			.commit()
			.catch(() => {});
		error(502, message);
	}
};
