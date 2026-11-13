<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let root: HTMLElement;
	let copied = $state(false);

	/** Full-screen, screen-on QR for in-person sharing. */
	onMount(() => {
		let lock: WakeLockSentinel | undefined;
		navigator.wakeLock
			?.request('screen')
			.then((l) => (lock = l))
			.catch(() => {});
		return () => lock?.release();
	});

	const fullscreen = () => root.requestFullscreen?.().catch(() => {});

	async function share() {
		const url = data.shareUrl.replace('src=qr', 'src=share');
		if (navigator.share) await navigator.share({ title: data.card.name, url }).catch(() => {});
		else copy();
	}

	async function copy() {
		await navigator.clipboard.writeText(data.card.url);
		copied = true;
	}
</script>

<svelte:head>
	<title>{data.card.name}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section bind:this={root} aria-label={data.card.name}>
	<button type="button" class="qr" onclick={fullscreen} aria-label={m.card_show_qr()}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.qr}
	</button>
	<p>{data.card.name}</p>
	<p>{data.card.url.replace('https://', '')}</p>
	<button type="button" onclick={share}>{m.card_share()}</button>
	<button type="button" onclick={copy}>{copied ? m.card_link_copied() : m.card_copy_link()}</button>
</section>

<style>
	.qr :global(svg) {
		display: block;
		width: min(80vw, 24rem);
		height: auto;
	}
</style>
