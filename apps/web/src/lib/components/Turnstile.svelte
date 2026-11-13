<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$app/env/public';
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY} data-size="flexible"></div>
