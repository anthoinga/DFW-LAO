<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Submissions</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	<h1>Submissions</h1>
	{#if data.user}<p>Signed in as {data.user}</p>{/if}

	<h2>Camp registrations ({data.registrations.length})</h2>
	<table>
		<thead
			><tr
				><th>Received</th><th>Season</th><th>Parent</th><th>Contact</th><th>Emergency</th><th
					>Campers</th
				><th>Photo release</th></tr
			></thead
		>
		<tbody>
			{#each data.registrations as r (r.id)}
				<tr>
					<td>{r.received_at}</td>
					<td>{r.season_year}</td>
					<td>{r.parent_name}</td>
					<td>{r.parent_email}<br />{r.parent_phone}</td>
					<td>{r.emergency_name}<br />{r.emergency_phone}</td>
					<td><pre>{JSON.stringify(JSON.parse(String(r.children ?? '[]')), null, 1)}</pre></td>
					<td>{r.photo_release ? 'Yes' : 'No'}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<h2>Community help requests ({data.assistance.length})</h2>
	<table>
		<thead
			><tr
				><th>Received</th><th>Name</th><th>Contact</th><th>Programs</th><th>Details</th><th
					>Language</th
				></tr
			></thead
		>
		<tbody>
			{#each data.assistance as a (a.id)}
				<tr>
					<td>{a.received_at}</td>
					<td>{a.first_name} {a.last_name}</td>
					<td>{a.email ?? ''}<br />{a.phone ?? ''}</td>
					<td>{JSON.parse(String(a.programs)).join(', ')}</td>
					<td>{a.details ?? ''}</td>
					<td>{a.preferred_language}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
