<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';
	import { m } from '#lib/paraglide/messages.js';

	type Message = { role: 'user' | 'assistant'; content: string };

	let messages = $state<Message[]>([]);
	let input = $state('');
	let busy = $state(false);
	let failed = $state(false);
	let chatToken = $state<string>();
	let turnstileToken = $state('');

	// Turnstile callback (implicit rendering calls a global function by name).
	if (typeof window !== 'undefined') {
		(window as unknown as Record<string, unknown>).onChatTurnstile = (token: string) =>
			(turnstileToken = token);
	}

	async function send(event: SubmitEvent) {
		event.preventDefault();
		const text = input.trim();
		if (!text || busy) return;
		input = '';
		busy = true;
		failed = false;
		messages.push({ role: 'user', content: text });
		const history = messages.map((x) => ({ ...x }));
		messages.push({ role: 'assistant', content: '' });
		const reply = messages[messages.length - 1];

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: history, turnstileToken, chatToken })
			});
			if (!res.ok || !res.body) throw new Error(String(res.status));
			chatToken = res.headers.get('x-chat-token') || chatToken;
			const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
			let buffer = '';
			for (;;) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += value;
				const events = buffer.split('\n\n');
				buffer = events.pop() ?? '';
				for (const e of events) {
					const data = JSON.parse(e.replace(/^data: /, '')) as {
						text?: string;
						error?: boolean;
						refusal?: boolean;
					};
					if (data.text) reply.content += data.text;
					if (data.error || data.refusal) failed = true;
				}
			}
		} catch {
			failed = true;
		} finally {
			if (!reply.content) messages.pop();
			busy = false;
		}
	}
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<section aria-label="Chat">
	<ol aria-live="polite">
		{#each messages as message, i (i)}
			<li data-role={message.role}>{message.content}</li>
		{/each}
	</ol>
	{#if failed}<p role="alert">{m.chat_unavailable()}</p>{/if}
	<form onsubmit={send}>
		<label class="sr-only" for="chat-input">{m.chat_placeholder()}</label>
		<input
			id="chat-input"
			bind:value={input}
			placeholder={m.chat_placeholder()}
			maxlength="1000"
			autocomplete="off"
		/>
		<button type="submit" disabled={busy}>{m.chat_send()}</button>
		{#if !chatToken}
			<div
				class="cf-turnstile"
				data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}
				data-callback="onChatTurnstile"
				data-size="flexible"
			></div>
		{/if}
	</form>
</section>
