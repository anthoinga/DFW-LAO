<script lang="ts">
	import Card from '#lib/components/Card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.card.name} · {data.card.org}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Card card={data.card} wallet={data.wallet} base={data.base} />
