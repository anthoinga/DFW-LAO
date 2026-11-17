<script lang="ts">
	import Card from '#lib/components/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.card.name}</title>
	<link rel="canonical" href={data.card.url} />
	{#if data.card.tagline}<meta name="description" content={data.card.tagline} />{/if}
</svelte:head>

<Card card={data.card} wallet={data.wallet} base={data.base} />
