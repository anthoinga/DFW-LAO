<script lang="ts">
	import RoutePage from '#lib/components/RoutePage.svelte';
	import { breadcrumbs, event } from '#lib/seo/jsonld.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const locale = $derived(getLocale());
</script>

<RoutePage
	data={data.page}
	jsonld={[
		event(data.event, locale),
		breadcrumbs(
			[
				{ name: 'Events', path: '/events' },
				{ name: data.page.title, path: data.page.path }
			],
			locale
		)
	]}
/>
