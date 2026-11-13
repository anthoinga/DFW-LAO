import { env } from './env.ts';

/** Cloudflare Turnstile server-side check. Uses Cloudflare's always-pass test key when unset (dev). */
export async function verifyTurnstile(token: FormDataEntryValue | null, ip?: string | null) {
	if (typeof token !== 'string' || !token) return false;
	const body = new FormData();
	body.append('secret', env.TURNSTILE_SECRET_KEY);
	body.append('response', token);
	if (ip) body.append('remoteip', ip);
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		body
	});
	const data = (await res.json()) as { success?: boolean };
	return Boolean(data.success);
}

const b64urlDecode = (s: string) =>
	Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

/**
 * Verifies the Cloudflare Access JWT on /admin requests (defense in depth behind the Access policy).
 * Returns the authenticated email, or null.
 */
export async function verifyAccess(request: Request): Promise<string | null> {
	const team = env.CF_ACCESS_TEAM_DOMAIN;
	const aud = env.CF_ACCESS_AUD;
	const token = request.headers.get('cf-access-jwt-assertion');
	if (!team || !aud || !token) return null;

	const [h, p, s] = token.split('.');
	if (!h || !p || !s) return null;
	const header = JSON.parse(new TextDecoder().decode(b64urlDecode(h))) as { kid: string };
	const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(p))) as {
		aud: string | string[];
		exp: number;
		email?: string;
		iss: string;
	};

	const certs = (await (await fetch(`https://${team}/cdn-cgi/access/certs`)).json()) as {
		keys: (JsonWebKey & { kid: string })[];
	};
	const jwk = certs.keys.find((k) => k.kid === header.kid);
	if (!jwk) return null;
	const key = await crypto.subtle.importKey(
		'jwk',
		jwk,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['verify']
	);
	const valid = await crypto.subtle.verify(
		'RSASSA-PKCS1-v1_5',
		key,
		b64urlDecode(s),
		new TextEncoder().encode(`${h}.${p}`)
	);
	const audOk = Array.isArray(payload.aud) ? payload.aud.includes(aud) : payload.aud === aud;
	if (!valid || !audOk || payload.exp * 1000 < Date.now() || payload.iss !== `https://${team}`)
		return null;
	return payload.email ?? null;
}

/** Constant-time comparison for webhook signatures. */
export function safeEqual(a: string, b: string) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export async function hmacSha256(secretKey: string, message: string): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secretKey),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

export const toBase64Url = (bytes: Uint8Array) =>
	btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

/**
 * Sanity webhook signature (`sanity-webhook-signature: t=<ts>,v1=<base64url HMAC of "ts.body">`).
 * Rejects signatures older than 5 minutes.
 */
export async function verifySanityWebhook(
	body: string,
	header: string | null,
	webhookSecret?: string
) {
	if (!header || !webhookSecret) return false;
	const parts = Object.fromEntries(
		header.split(',').map((kv) => kv.trim().split('=') as [string, string])
	);
	const ts = Number(parts.t);
	if (!parts.v1 || !ts || Math.abs(Date.now() - ts) > 5 * 60_000) return false;
	const expected = toBase64Url(await hmacSha256(webhookSecret, `${ts}.${body}`));
	return safeEqual(expected, parts.v1);
}
