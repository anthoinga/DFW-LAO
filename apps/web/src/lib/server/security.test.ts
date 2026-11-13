import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({}));
vi.mock('$app/env/public', () => ({}));

const { hmacSha256, toBase64Url, verifySanityWebhook } = await import('./security.ts');

describe('verifySanityWebhook', () => {
	const body = JSON.stringify({ _id: 'event-1' });

	it('accepts a fresh, correctly signed payload', async () => {
		const ts = Date.now();
		const sig = toBase64Url(await hmacSha256('s3cret', `${ts}.${body}`));
		expect(await verifySanityWebhook(body, `t=${ts},v1=${sig}`, 's3cret')).toBe(true);
	});

	it('rejects wrong secrets, stale timestamps and missing headers', async () => {
		const ts = Date.now();
		const sig = toBase64Url(await hmacSha256('other', `${ts}.${body}`));
		expect(await verifySanityWebhook(body, `t=${ts},v1=${sig}`, 's3cret')).toBe(false);

		const old = Date.now() - 10 * 60_000;
		const oldSig = toBase64Url(await hmacSha256('s3cret', `${old}.${body}`));
		expect(await verifySanityWebhook(body, `t=${old},v1=${oldSig}`, 's3cret')).toBe(false);

		expect(await verifySanityWebhook(body, null, 's3cret')).toBe(false);
	});
});
