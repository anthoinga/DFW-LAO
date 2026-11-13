import Anthropic from '@anthropic-ai/sdk';
import { llmsFullTxt } from '#lib/agent/llms.ts';
import { hmacSha256, safeEqual, toBase64Url } from './security';
import { env } from './env.ts';

export const CHAT_MODEL = 'claude-haiku-5-5';
export const MAX_TURNS = 12;
export const MAX_MESSAGE_CHARS = 1000;

const INSTRUCTIONS = `You are the website assistant for DFW Lao Heritage, a volunteer-run 501(c)(3) nonprofit in Dallas–Fort Worth.
Answer questions about the organization, its Lao arts & culture summer camp, events, community help, and ways to support it.

Rules:
- Use only the site content provided below. If the answer is not there, say you don't know and point to the contact page.
- Reply in the language the visitor writes in (English or Lao).
- Keep answers short and friendly. Link to the most relevant page using the "Source:" URLs.
- Never ask for or repeat sensitive personal information (medical, immigration, benefits). For help requests, point to the secure form at /help/request.
- You cannot register people, take payments, or change anything on the site.`;

let corpus: { at: number; text: string } | undefined;

/** Stable system prompt: instructions + full site text. Rebuilt at most every 15 minutes. */
export async function systemPrompt(): Promise<string> {
	if (!corpus || Date.now() - corpus.at > 15 * 60_000) {
		corpus = { at: Date.now(), text: await llmsFullTxt('en') };
	}
	return `${INSTRUCTIONS}\n\n<site_content>\n${corpus.text}\n</site_content>`;
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function validateMessages(input: unknown): ChatMessage[] | null {
	if (!Array.isArray(input) || input.length === 0 || input.length > MAX_TURNS * 2) return null;
	const messages = input.filter(
		(m): m is ChatMessage =>
			(m?.role === 'user' || m?.role === 'assistant') &&
			typeof m.content === 'string' &&
			m.content.length > 0 &&
			m.content.length <= MAX_MESSAGE_CHARS * 4
	);
	if (messages.length !== input.length || messages.at(-1)?.role !== 'user') return null;
	if (messages.at(-1)!.content.length > MAX_MESSAGE_CHARS) return null;
	return messages;
}

/** Streams the reply as server-sent events: `data: {"text": "..."}` chunks, then `data: {"done": true}`. */
export function streamReply(
	apiKey: string,
	system: string,
	messages: ChatMessage[]
): ReadableStream<Uint8Array> {
	const client = new Anthropic({ apiKey });
	const encoder = new TextEncoder();
	const send = (controller: ReadableStreamDefaultController<Uint8Array>, data: unknown) =>
		controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

	return new ReadableStream({
		async start(controller) {
			try {
				const stream = client.messages.stream({
					model: CHAT_MODEL,
					max_tokens: 1024,
					output_config: { effort: 'low' },
					system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
					messages
				});
				for await (const event of stream) {
					if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
						send(controller, { text: event.delta.text });
					}
				}
				const final = await stream.finalMessage();
				if (final.stop_reason === 'refusal') send(controller, { refusal: true });
				console.log('chat usage', JSON.stringify(final.usage));
				send(controller, { done: true });
			} catch (err) {
				console.error('chat error', err instanceof Anthropic.APIError ? err.status : err);
				send(controller, { error: true });
			} finally {
				controller.close();
			}
		}
	});
}

/** Short-lived chat session token, issued after a Turnstile check so later turns skip the widget. */
export async function issueChatToken(now = Date.now()) {
	const key = env.TURNSTILE_SECRET_KEY;
	const exp = now + 30 * 60_000;
	return `${exp}.${toBase64Url(await hmacSha256(key, `chat.${exp}`))}`;
}

export async function verifyChatToken(token: string | undefined, now = Date.now()) {
	if (!token) return false;
	const [exp, sig] = token.split('.');
	if (!exp || !sig || Number(exp) < now) return false;
	const key = env.TURNSTILE_SECRET_KEY;
	return safeEqual(sig, toBase64Url(await hmacSha256(key, `chat.${exp}`)));
}
