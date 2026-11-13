/**
 * Translates interface strings from apps/web/messages/en.json into lo.json with Claude.
 *
 *   pnpm i18n:ui              translate keys missing from lo.json
 *   pnpm i18n:ui --keys a,b   re-translate specific keys (e.g. after editing their English)
 *   pnpm i18n:ui --all        re-translate everything
 *
 * Requires ANTHROPIC_API_KEY. Review the resulting diff before committing.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { claudeTranslator } from '../src/lib/server/translate/claude.ts';

const dir = new URL('../messages/', import.meta.url);
const read = (name: string) =>
	JSON.parse(readFileSync(new URL(name, dir), 'utf8')) as Record<string, string>;

const en = read('en.json');
const lo = read('lo.json');
const args = process.argv.slice(2);
const keysArg = args[args.indexOf('--keys') + 1];
const forced = args.includes('--all')
	? Object.keys(en)
	: args.includes('--keys') && keysArg
		? keysArg.split(',')
		: [];

const todo = Object.keys(en).filter((k) => k !== '$schema' && (forced.includes(k) || !(k in lo)));
if (todo.length === 0) {
	console.log('lo.json is up to date.');
	process.exit(0);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error('Set ANTHROPIC_API_KEY to translate interface strings.');

const translations = await claudeTranslator(apiKey)(
	todo.map((id) => ({ id, text: en[id] })),
	{ terms: [{ en: 'DFW Lao Heritage', note: 'Keep in Latin script' }] }
);

const next: Record<string, string> = { $schema: en.$schema };
for (const key of Object.keys(en)) {
	if (key === '$schema') continue;
	next[key] = translations.get(key) ?? lo[key] ?? en[key];
}
writeFileSync(new URL('lo.json', dir), JSON.stringify(next, null, '\t') + '\n');
console.log(`Translated ${translations.size} of ${todo.length} strings into lo.json.`);
