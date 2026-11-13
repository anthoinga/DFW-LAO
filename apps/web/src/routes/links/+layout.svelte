<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1f2a44" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
</svelte:head>

<main>
	{@render children()}
</main>
