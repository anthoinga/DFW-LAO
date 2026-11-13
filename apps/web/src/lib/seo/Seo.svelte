<script lang="ts">
	import { SITE_URL } from '#lib/config.ts';
	import { alternates } from '#lib/i18n/index.ts';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { jsonLdTag } from './jsonld.ts';

	type Props = {
		title: string;
		description?: string;
		path: string;
		image?: string;
		noindex?: boolean;
		canonical?: string;
		jsonld?: unknown[];
	};

	let {
		title,
		description,
		path,
		image,
		noindex = false,
		canonical,
		jsonld = []
	}: Props = $props();

	const locale = $derived(getLocale());
	const url = $derived(canonical ?? SITE_URL + localizeHref(path, { locale }));
	const mdPath = $derived(localizeHref(path === '/' ? '/index.md' : `${path}.md`, { locale }));
	const fullTitle = $derived(title === 'DFW Lao Heritage' ? title : `${title} | DFW Lao Heritage`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if description}<meta name="description" content={description} />{/if}
	<link rel="canonical" href={url} />
	{#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
	{#each alternates(path) as alt (alt.hreflang)}
		<link rel="alternate" hreflang={alt.hreflang} href={alt.href} />
	{/each}
	<link rel="alternate" type="text/markdown" href={mdPath} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={fullTitle} />
	{#if description}<meta property="og:description" content={description} />{/if}
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={locale === 'lo' ? 'lo_LA' : 'en_US'} />
	{#if image}<meta property="og:image" content={image} />{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
	{#each jsonld as data, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLdTag(data)}
	{/each}
</svelte:head>
