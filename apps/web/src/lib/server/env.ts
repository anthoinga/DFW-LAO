import * as privateEnv from '$app/env/private';
import * as publicEnv from '$app/env/public';

/** Typed, validated environment (see src/env.ts). */
export const env = { ...privateEnv, ...publicEnv };

export const isSanityConfigured = () =>
	Boolean(env.PUBLIC_SANITY_PROJECT_ID && env.PUBLIC_SANITY_PROJECT_ID !== 'replace-me');
