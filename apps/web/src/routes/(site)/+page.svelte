<script lang="ts">
	import RoutePage from '#lib/components/RoutePage.svelte';
	import { organization } from '#lib/seo/jsonld.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<RoutePage {data} jsonld={[organization(data.site, getLocale())]} />
