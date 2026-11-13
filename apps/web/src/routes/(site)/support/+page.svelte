<script lang="ts">
	import { enhance } from '$app/forms';
	import RoutePage from '#lib/components/RoutePage.svelte';
	import Turnstile from '#lib/components/Turnstile.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const giving = $derived(data.site.settings.giving ?? {});
</script>

<RoutePage {data}>
	<section id="donate">
		<h2>Donate</h2>
		<ul>
			{#if giving.donorbox}<li><a href={giving.donorbox}>Donate online</a></li>{/if}
			{#if giving.paypal}<li><a href={giving.paypal}>PayPal</a></li>{/if}
			{#if giving.venmo}<li>Venmo: {giving.venmo}</li>{/if}
			{#if giving.zelle}<li>Zelle: {giving.zelle}</li>{/if}
		</ul>
	</section>

	<section id="sponsor">
		<h2>Sponsor a student</h2>
		{#if giving.donorbox}<a href={giving.donorbox}>Sponsor a camper</a>{/if}
	</section>

	<section id="volunteer">
		<h2>Volunteer</h2>
		{#if form?.success}
			<p role="status">Thank you for offering to help! We'll be in touch.</p>
		{:else}
			<form method="POST" action="?/volunteer" use:enhance>
				<label>Name <input name="name" required autocomplete="name" /></label>
				<label>Email <input name="email" type="email" required autocomplete="email" /></label>
				<fieldset>
					<legend>Interests</legend>
					{#each ['camp', 'events', 'community-help', 'teaching', 'other'] as interest (interest)}
						<label><input type="checkbox" name="interests[]" value={interest} /> {interest}</label>
					{/each}
				</fieldset>
				<label>Message <textarea name="message"></textarea></label>
				<Turnstile />
				<button type="submit">Send</button>
			</form>
		{/if}
	</section>
</RoutePage>
