<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '#lib/seo/Seo.svelte';
	import Turnstile from '#lib/components/Turnstile.svelte';
	import { ASSISTANCE_PROGRAMS } from '#lib/forms-constants.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const errors = $derived((form?.errors ?? {}) as Record<string, string[]>);
</script>

<Seo title={data.page.title} path={data.page.path} description={data.page.description} />

<h1>{data.page.title}</h1>

{#if form?.success}
	<p role="status">Thank you. Someone from our team will contact you soon.</p>
{:else}
	<p>
		Your information is kept private, used only to help you, and deleted automatically after one
		year.
	</p>
	<form method="POST" use:enhance>
		<label>First name <input name="firstName" required autocomplete="given-name" /></label>
		<label>Last name <input name="lastName" required autocomplete="family-name" /></label>
		<label>Email <input name="email" type="email" autocomplete="email" /></label>
		<label>Phone <input name="phone" type="tel" autocomplete="tel" /></label>
		<fieldset>
			<legend>What do you need help with?</legend>
			{#each ASSISTANCE_PROGRAMS as program (program)}
				<label><input type="checkbox" name="programs[]" value={program} /> {program}</label>
			{/each}
		</fieldset>
		<label>Anything else we should know? <textarea name="details"></textarea></label>
		<label>
			Preferred language
			<select name="preferredLanguage">
				<option value="en" selected={getLocale() === 'en'}>English</option>
				<option value="lo" selected={getLocale() === 'lo'}>ລາວ</option>
			</select>
		</label>
		<label
			><input type="checkbox" name="consent" required /> I agree to DFW Lao Heritage storing this information
			to help me</label
		>

		<Turnstile />
		{#each Object.entries(errors) as [field, messages] (field)}
			<p role="alert">{field}: {messages.join(', ')}</p>
		{/each}
		<button type="submit">Send request</button>
	</form>
{/if}
