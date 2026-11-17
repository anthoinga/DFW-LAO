<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import type { CardView } from '#lib/server/card.ts';

	type Props = { card: CardView; wallet: { google: boolean; apple: boolean }; base?: string };
	let { card, wallet, base = '' }: Props = $props();

	const suffix = $derived(card.kind === 'person' ? `/${card.id}` : '');
	let copied = $state(false);

	async function share() {
		const data = { title: card.name, text: card.tagline, url: card.url };
		if (navigator.share) await navigator.share(data).catch(() => {});
		else {
			await navigator.clipboard.writeText(card.url);
			copied = true;
		}
	}
</script>

<article>
	<h1>{card.name}</h1>
	{#if card.role}<p>{card.role}{card.kind === 'person' ? ` · ${card.org}` : ''}</p>{/if}
	{#if card.tagline}<p>{card.tagline}</p>{/if}

	<ul aria-label="Links">
		{#each card.links as link (link.href)}
			<li><a href={link.href} data-icon={link.icon}>{link.label}</a></li>
		{/each}
	</ul>

	<ul aria-label="Social">
		{#each card.socials as social (social.href)}
			<li><a href={social.href} rel="noopener" data-icon={social.icon}>{social.label}</a></li>
		{/each}
	</ul>

	<div>
		<a href={localizeHref(`${base}/vcard${suffix}`)} download>{m.card_save_contact()}</a>
		<button type="button" onclick={share}>{copied ? m.card_link_copied() : m.card_share()}</button>
		<a href={localizeHref(`${base}/share${suffix}`)}>{m.card_show_qr()}</a>
		{#if wallet.google}<a href={`${base}/wallet/google${suffix}`}>{m.card_add_wallet()} (Google)</a
			>{/if}
		{#if wallet.apple}<a href={`${base}/wallet/apple${suffix}`}>{m.card_add_wallet()} (Apple)</a
			>{/if}
	</div>
</article>
