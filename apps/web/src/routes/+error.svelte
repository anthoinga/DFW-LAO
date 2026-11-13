<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
</script>

<svelte:head>
	<title>{page.status} | DFW Lao Heritage</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<h1>{page.status === 404 ? m.not_found() : page.error?.message}</h1>
	<p><a href={localizeHref('/')}>{m.back_home()}</a></p>
</main>
