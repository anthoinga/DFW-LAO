<script lang="ts">
	import RoutePage from '#lib/components/RoutePage.svelte';
	import { person } from '#lib/seo/jsonld.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<RoutePage
	data={data.page}
	jsonld={[person(data.person.name, data.person.role, data.person.slug, getLocale())]}
/>
