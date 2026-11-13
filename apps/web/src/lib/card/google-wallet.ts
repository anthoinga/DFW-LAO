import { trackedUrl } from './qr';
import type { PassCard } from './types';

export type GoogleWalletConfig = {
	issuerId: string;
	serviceAccountEmail: string;
	privateKeyPem: string;
	origin: string;
};

const b64url = (bytes: Uint8Array) =>
	btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
const b64urlJson = (value: unknown) => b64url(new TextEncoder().encode(JSON.stringify(value)));

async function importKey(pem: string) {
	const body = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\\n|\s/g, '');
	const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
	return crypto.subtle.importKey(
		'pkcs8',
		der,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);
}

/**
 * "Save to Google Wallet" JWT for a Generic pass (object embedded in the JWT, so no API call is needed).
 * Open `https://pay.google.com/gp/v/save/<jwt>` to add it.
 */
export async function googleWalletJwt(config: GoogleWalletConfig, card: PassCard): Promise<string> {
	const classId = `${config.issuerId}.dfw-lao-card`;
	const object = {
		id: `${config.issuerId}.dfw-lao-${card.id}`,
		classId,
		state: 'ACTIVE',
		cardTitle: { defaultValue: { language: 'en-US', value: card.org } },
		header: { defaultValue: { language: 'en-US', value: card.name } },
		subheader: card.title ? { defaultValue: { language: 'en-US', value: card.title } } : undefined,
		hexBackgroundColor: '#1f2a44',
		barcode: {
			type: 'QR_CODE',
			value: trackedUrl(card.url, 'wallet', card.id),
			alternateText: card.url.replace('https://', '')
		},
		linksModuleData: { uris: [{ uri: card.url, description: 'Open card', id: 'card' }] }
	};
	const claims = {
		iss: config.serviceAccountEmail,
		aud: 'google',
		typ: 'savetowallet',
		iat: Math.floor(Date.now() / 1000),
		origins: [config.origin],
		payload: { genericClasses: [{ id: classId }], genericObjects: [object] }
	};
	const unsigned = `${b64urlJson({ alg: 'RS256', typ: 'JWT' })}.${b64urlJson(claims)}`;
	const key = await importKey(config.privateKeyPem);
	const signature = new Uint8Array(
		await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
	);
	return `${unsigned}.${b64url(signature)}`;
}
