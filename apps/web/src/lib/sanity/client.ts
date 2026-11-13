import { createClient, type SanityClient } from '@sanity/client';
import { env, isSanityConfigured } from '#lib/server/env.ts';

let client: SanityClient | null | undefined;

/** Read client, or null when the project isn't configured yet (site renders fallback content). */
export function sanity(): SanityClient | null {
	if (client !== undefined) return client;
	if (!isSanityConfigured()) return (client = null);
	client = createClient({
		projectId: env.PUBLIC_SANITY_PROJECT_ID,
		dataset: env.PUBLIC_SANITY_DATASET,
		apiVersion: '2026-11-01',
		useCdn: !env.SANITY_READ_TOKEN,
		token: env.SANITY_READ_TOKEN,
		perspective: 'published'
	});
	return client;
}

/** Write client for the given dataset (translation service, inbox submissions). */
export function sanityWriter(dataset?: string): SanityClient | null {
	if (!isSanityConfigured()) return null;
	if (!env.SANITY_WRITE_TOKEN) return null;
	return createClient({
		projectId: env.PUBLIC_SANITY_PROJECT_ID,
		dataset: dataset ?? env.PUBLIC_SANITY_DATASET,
		apiVersion: '2026-11-01',
		useCdn: false,
		token: env.SANITY_WRITE_TOKEN
	});
}

export async function fetchOr<T>(
	query: string,
	params: Record<string, unknown>,
	fallback: T
): Promise<T> {
	const c = sanity();
	if (!c) return fallback;
	return ((await c.fetch(query, params)) as T | null) ?? fallback;
}
