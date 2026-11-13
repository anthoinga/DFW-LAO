import { error, json } from '@sveltejs/kit';
import {
	issueChatToken,
	streamReply,
	systemPrompt,
	validateMessages,
	verifyChatToken
} from '#lib/server/chat.ts';
import { env } from '#lib/server/env.ts';
import { verifyTurnstile } from '#lib/server/security.ts';
import type { RequestHandler } from './$types';

/**
 * POST { messages, turnstileToken? , chatToken? } → text/event-stream.
 * Guarded by Turnstile (first turn), a per-IP rate limit, a daily global cap and the prepaid API balance.
 */
export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) return json({ error: 'unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as {
		messages?: unknown;
		turnstileToken?: string;
		chatToken?: string;
	} | null;
	const messages = validateMessages(body?.messages);
	if (!messages) error(400, 'Invalid messages');

	const ip = getClientAddress();
	let chatToken = body?.chatToken;
	if (!(await verifyChatToken(chatToken))) {
		if (!(await verifyTurnstile(body?.turnstileToken ?? null, ip)))
			error(403, 'Verification required');
		chatToken = await issueChatToken();
	}

	const bindings = platform?.env;
	if (bindings?.CHAT_LIMITER) {
		const { success } = await bindings.CHAT_LIMITER.limit({ key: ip });
		if (!success) return json({ error: 'rate_limited' }, { status: 429 });
	}
	if (bindings?.KV) {
		const key = `chat:${new Date().toISOString().slice(0, 10)}`;
		const count = Number((await bindings.KV.get(key)) ?? 0);
		if (count >= env.CHAT_DAILY_LIMIT) {
			return json({ error: 'daily_limit' }, { status: 429 });
		}
		await bindings.KV.put(key, String(count + 1), { expirationTtl: 2 * 86_400 });
	}

	return new Response(streamReply(apiKey, await systemPrompt(), messages), {
		headers: {
			'content-type': 'text/event-stream; charset=utf-8',
			'cache-control': 'no-store',
			'x-chat-token': chatToken ?? ''
		}
	});
};
