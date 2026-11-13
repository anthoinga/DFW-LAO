<script lang="ts">
	import RoutePage from '#lib/components/RoutePage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<RoutePage {data} />
