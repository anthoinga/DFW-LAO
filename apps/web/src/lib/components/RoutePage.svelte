<script lang="ts">
	import Seo from '#lib/seo/Seo.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		data: { path: string; title: string; description?: string; noindex: boolean; markdown: string };
		jsonld?: unknown[];
		children?: Snippet;
	};

	let { data, jsonld = [], children }: Props = $props();

	/** Placeholder rendering until the design system lands: headings + paragraphs from the page Markdown. */
	const blocks = $derived(
		data.markdown
			.split(/\n{2,}/)
			.slice(1)
			.map((b) => b.trim())
			.filter(Boolean)
	);
</script>

<Seo
	title={data.title}
	description={data.description}
	path={data.path}
	noindex={data.noindex}
	{jsonld}
/>

<article>
	<h1>{data.title}</h1>
	{#each blocks as block, i (i)}
		{#if block.startsWith('### ')}
			<h3>{block.slice(4)}</h3>
		{:else if block.startsWith('## ')}
			<h2>{block.slice(3)}</h2>
		{:else}
			<p style="white-space: pre-line">{block}</p>
		{/if}
	{/each}
	{@render children?.()}
</article>
