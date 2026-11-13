<script lang="ts">
	import { enhance } from '$app/forms';
	import RoutePage from '#lib/components/RoutePage.svelte';
	import Turnstile from '#lib/components/Turnstile.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<RoutePage {data}>
	{#if form?.success}
		<p role="status">Thank you! We'll get back to you soon.</p>
	{:else}
		<form method="POST" action="?/contact" use:enhance>
			<label>Name <input name="name" required autocomplete="name" /></label>
			<label>Email <input name="email" type="email" required autocomplete="email" /></label>
			<label>Subject <input name="subject" /></label>
			<label>Message <textarea name="message" required></textarea></label>
			<Turnstile />
			<button type="submit">Send</button>
		</form>
	{/if}
</RoutePage>
