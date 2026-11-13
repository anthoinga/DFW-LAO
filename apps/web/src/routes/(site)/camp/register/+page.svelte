<script lang="ts">
	import { enhance } from '$app/forms';
	import Seo from '#lib/seo/Seo.svelte';
	import Turnstile from '#lib/components/Turnstile.svelte';
	import { TSHIRT_SIZES } from '#lib/forms-constants.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let children = $state([0]);
	const errors = $derived((form?.errors ?? {}) as Record<string, string[]>);
</script>

<Seo title={data.page.title} path={data.page.path} description={data.page.description} />

<h1>{data.page.title}{data.season ? ` ${data.season.year}` : ''}</h1>

{#if form?.success}
	<p role="status">
		Thank you! Your registration was received. Check your email for a confirmation.
	</p>
{:else if !data.season?.open}
	<p>Registration is currently closed.</p>
{:else}
	<form method="POST" use:enhance>
		{#each children as id, i (id)}
			<fieldset>
				<legend>Camper {i + 1}</legend>
				<label>First name <input name="children.{i}.firstName" required autocomplete="off" /></label
				>
				<label>Last name <input name="children.{i}.lastName" required autocomplete="off" /></label>
				<label>Age <input name="children.{i}.age" type="number" min="6" max="18" required /></label>
				<label>
					T-shirt size
					<select name="children.{i}.tshirtSize" required>
						{#each TSHIRT_SIZES as size (size)}<option>{size}</option>{/each}
					</select>
				</label>
				<label
					>Allergies or medical notes <textarea name="children.{i}.allergiesMedical"
					></textarea></label
				>
			</fieldset>
		{/each}
		<button type="button" onclick={() => (children = [...children, children.length])}
			>Add another camper</button
		>

		<fieldset>
			<legend>Parent or guardian</legend>
			<label>Name <input name="parentName" required autocomplete="name" /></label>
			<label>Email <input name="parentEmail" type="email" required autocomplete="email" /></label>
			<label>Phone <input name="parentPhone" type="tel" required autocomplete="tel" /></label>
		</fieldset>

		<fieldset>
			<legend>Emergency contact</legend>
			<label>Name <input name="emergencyName" required /></label>
			<label>Phone <input name="emergencyPhone" type="tel" required /></label>
		</fieldset>

		<label><input type="checkbox" name="volunteerInterest" /> I'm open to volunteering</label>
		<label
			><input type="checkbox" name="photoRelease" /> Photos of my child(ren) may be used to share camp
			highlights</label
		>
		<label
			><input type="checkbox" name="liabilityConsent" required /> I agree to the camp participation and
			liability terms</label
		>
		<label>Comments <textarea name="comments"></textarea></label>

		<Turnstile />
		{#each Object.entries(errors) as [field, messages] (field)}
			<p role="alert">{field}: {messages.join(', ')}</p>
		{/each}
		<button type="submit">Register</button>
	</form>
{/if}
