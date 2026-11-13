import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import type { TextUnit } from './fields.ts';
import type { Glossary, Translator } from './pipeline.ts';

export const TRANSLATION_MODEL = 'claude-opus-5-5';

const Output = z.object({
	translations: z.array(z.object({ id: z.string(), lao: z.string() }))
});

function instructions(glossary: Glossary) {
	const terms = (glossary.terms ?? [])
		.map(
			(t) =>
				`- "${t.en}" → ${t.lo ? `"${t.lo}"` : 'keep as written'}${t.note ? ` (${t.note})` : ''}`
		)
		.join('\n');
	return `You translate website content for DFW Lao Heritage, a Lao-American cultural nonprofit in Dallas–Fort Worth, from English into Lao (ພາສາລາວ).

Style: ${glossary.styleNotes ?? 'Respectful, plain Lao readable by elders.'}
- Keep numbers, dates, times, prices, URLs, email addresses and phone numbers exactly as written.
- Keep leading/trailing spaces of each text as in the source, because texts may be fragments of one sentence.
- Translate every item. Return one entry per input id, with the same id.

Glossary:
${terms || '- (none)'}`;
}

/** Translator backed by the Claude API. Throws on refusal or invalid output so the caller keeps the old Lao value. */
export function claudeTranslator(apiKey: string): Translator {
	const client = new Anthropic({ apiKey });
	return async (units: TextUnit[], glossary: Glossary) => {
		const response = await client.beta.messages.parse({
			model: TRANSLATION_MODEL,
			max_tokens: 32000,
			betas: ['server-side-fallback-2026-07-01'],
			fallbacks: 'default',
			output_config: { effort: 'medium', format: betaZodOutputFormat(Output) },
			system: [
				{ type: 'text', text: instructions(glossary), cache_control: { type: 'ephemeral' } }
			],
			messages: [{ role: 'user', content: JSON.stringify(units) }]
		});
		if (response.stop_reason === 'refusal') throw new Error('Translation refused');
		if (response.stop_reason === 'max_tokens') throw new Error('Translation truncated');
		const parsed = response.parsed_output;
		if (!parsed) throw new Error('Translation output did not match the schema');
		return new Map(parsed.translations.map((t) => [t.id, t.lao]));
	};
}
