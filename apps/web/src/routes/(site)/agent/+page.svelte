<script lang="ts">
	import Chat from '#lib/components/Chat.svelte';
	import RoutePage from '#lib/components/RoutePage.svelte';
	import { SITE_URL } from '#lib/config.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const endpoints = [
		{ label: 'llms.txt', href: '/llms.txt', note: 'Summary and index of every page' },
		{ label: 'llms-full.txt', href: '/llms-full.txt', note: 'All site content in one file' },
		{ label: 'Markdown pages', href: '/camp.md', note: 'Add .md to any page URL' },
		{ label: 'JSON API', href: '/api/v1', note: 'Read-only, no key required' },
		{ label: 'MCP server', href: '/mcp', note: `Streamable HTTP: ${SITE_URL}/mcp` }
	];
</script>

<RoutePage {data}>
	<Chat />
	<h2>Machine-readable access</h2>
	<ul>
		{#each endpoints as e (e.href)}
			<li><a href={e.href}>{e.label}</a> — {e.note}</li>
		{/each}
	</ul>
</RoutePage>
