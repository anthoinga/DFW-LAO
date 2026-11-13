/**
 * Translates every translatable CMS document whose English changed (or has no Lao yet).
 * Same logic as the publish webhook; use it once after the first content entry, or after
 * editing the glossary (`--force` re-translates everything).
 *
 *   pnpm i18n:backfill [--force] [--dry-run]
 *
 * Requires ANTHROPIC_API_KEY, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET and SANITY_WRITE_TOKEN.
 */
import { createClient } from '@sanity/client';
import { claudeTranslator } from '../src/lib/server/translate/claude.ts';
import { planTranslation, type Glossary } from '../src/lib/server/translate/pipeline.ts';

const { ANTHROPIC_API_KEY, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN } =
	process.env;
if (!ANTHROPIC_API_KEY || !PUBLIC_SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
	throw new Error('Set ANTHROPIC_API_KEY, PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN.');
}

const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');
const client = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET || 'production',
	apiVersion: '2026-11-01',
	token: SANITY_WRITE_TOKEN,
	useCdn: false,
	perspective: 'published'
});

const TYPES = ['page', 'campSeason', 'event', 'teamMember', 'faq', 'linkCard', 'orgFacts'];
const [docs, glossary] = await Promise.all([
	client.fetch<Record<string, unknown>[]>(`*[_type in $types]`, { types: TYPES }),
	client.fetch<Glossary | null>(`*[_id == "i18nGlossary"][0]{ styleNotes, terms }`)
]);

const translate = claudeTranslator(ANTHROPIC_API_KEY);
let total = 0;
for (const doc of docs) {
	const meta = (doc.i18nMeta ?? {}) as Record<string, unknown>;
	const input = force ? { ...doc, i18nMeta: { ...meta, forceAt: new Date().toISOString() } } : doc;
	const plan = await planTranslation(input, translate, glossary ?? {});
	if (!plan) continue;
	total += plan.translated;
	console.log(`${doc._type} ${doc._id}: ${plan.translated} field(s)`);
	if (!dryRun)
		await client.patch(String(doc._id)).set(plan.set).commit({ autoGenerateArrayKeys: true });
}
console.log(
	`${dryRun ? 'Would translate' : 'Translated'} ${total} field(s) across ${docs.length} document(s).`
);
