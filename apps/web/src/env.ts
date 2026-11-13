import { defineEnvVars } from '@sveltejs/kit/env';

/** Optional string: empty values are treated as unset. */
const optional = (value: string | undefined) => value || undefined;

/**
 * Every environment variable the site reads. Public values are safe for the browser;
 * everything else is server-only. Missing optional values disable the related feature.
 */
export const variables = defineEnvVars({
	PUBLIC_SANITY_PROJECT_ID: { public: true, schema: optional, description: 'Sanity project ID' },
	PUBLIC_SANITY_DATASET: { public: true, schema: (v) => v || 'production' },
	PUBLIC_TURNSTILE_SITE_KEY: {
		public: true,
		schema: (v) => v || '1x00000000000000000000AA',
		description: 'Cloudflare Turnstile site key (defaults to the always-pass test key)'
	},

	SANITY_READ_TOKEN: { schema: optional },
	SANITY_WRITE_TOKEN: {
		schema: optional,
		description: 'Translation write-back and Inbox submissions'
	},
	SANITY_WEBHOOK_SECRET: { schema: optional },

	TURNSTILE_SECRET_KEY: { schema: (v) => v || '1x0000000000000000000000000000000AA' },
	RESEND_API_KEY: { schema: optional },
	NOTIFY_EMAIL: { schema: (v) => v || 'dfwlaoheritage@gmail.com' },
	MAIL_FROM: { schema: (v) => v || 'DFW Lao Heritage <noreply@dallasfwlaoheritage.com>' },

	ANTHROPIC_API_KEY: { schema: optional, description: 'Claude API key for chat and translation' },
	CHAT_DAILY_LIMIT: {
		schema: (v) => {
			const n = Number(v ?? 500);
			if (!Number.isInteger(n) || n < 0)
				throw new Error('CHAT_DAILY_LIMIT must be a positive integer');
			return n;
		}
	},

	CF_ACCESS_TEAM_DOMAIN: { schema: optional },
	CF_ACCESS_AUD: { schema: optional },

	GOOGLE_WALLET_ISSUER_ID: { schema: optional },
	GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL: { schema: optional },
	GOOGLE_WALLET_PRIVATE_KEY: { schema: optional },
	APPLE_WALLET_ENABLED: { schema: (v) => v === 'true' },
	APPLE_PASS_TYPE_ID: { schema: optional },
	APPLE_TEAM_ID: { schema: optional }
});
