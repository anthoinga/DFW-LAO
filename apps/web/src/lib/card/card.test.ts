import { describe, expect, it } from 'vitest';
import { vcard } from './vcard';
import { qrSvg, trackedUrl } from './qr';
import { googleWalletJwt } from './google-wallet';
import { applePassJson } from './apple-wallet';

describe('vcard', () => {
	it('builds a valid, escaped vCard', () => {
		const card = vcard({
			name: 'Kelly Phommachanh',
			org: 'DFW Lao Heritage',
			title: 'Executive Director, Camp',
			phone: '682-331-7779',
			url: 'https://links.dallasfwlaoheritage.com/kelly'
		});
		expect(card.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
		expect(card).toContain('N:Phommachanh;Kelly;;;');
		expect(card).toContain('TITLE:Executive Director\\, Camp');
		expect(card.trimEnd().endsWith('END:VCARD')).toBe(true);
	});
});

describe('qr', () => {
	it('adds attribution params and renders SVG', () => {
		const url = trackedUrl('https://links.dallasfwlaoheritage.com/kelly', 'qr', 'kelly');
		expect(url).toBe('https://links.dallasfwlaoheritage.com/kelly?src=qr&p=kelly');
		expect(qrSvg(url)).toMatch(/^<svg/);
	});
});

describe('google wallet', () => {
	it('signs an RS256 JWT for a generic pass', async () => {
		const { privateKey } = await crypto.subtle.generateKey(
			{
				name: 'RSASSA-PKCS1-v1_5',
				modulusLength: 2048,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256'
			},
			true,
			['sign', 'verify']
		);
		const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', privateKey));
		const pem = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...pkcs8))}\n-----END PRIVATE KEY-----`;
		const jwt = await googleWalletJwt(
			{
				issuerId: '123',
				serviceAccountEmail: 'svc@example.iam.gserviceaccount.com',
				privateKeyPem: pem,
				origin: 'https://links.dallasfwlaoheritage.com'
			},
			{
				id: 'kelly',
				name: 'Kelly Phommachanh',
				title: 'Executive Director',
				org: 'DFW Lao Heritage',
				url: 'https://links.dallasfwlaoheritage.com/kelly'
			}
		);
		const [header, payload, sig] = jwt.split('.');
		expect(JSON.parse(atob(header))).toEqual({ alg: 'RS256', typ: 'JWT' });
		const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
		expect(claims.typ).toBe('savetowallet');
		expect(claims.payload.genericObjects[0].id).toBe('123.dfw-lao-kelly');
		expect(sig.length).toBeGreaterThan(100);
	});
});

describe('apple wallet', () => {
	it('builds pass.json with a QR barcode', () => {
		const pass = applePassJson(
			{ passTypeId: 'pass.com.example.card', teamId: 'TEAM123' },
			{
				id: 'kelly',
				name: 'Kelly Phommachanh',
				title: 'Executive Director',
				org: 'DFW Lao Heritage',
				url: 'https://links.dallasfwlaoheritage.com/kelly'
			}
		);
		expect(pass.formatVersion).toBe(1);
		expect(pass.barcodes[0].message).toContain('src=wallet');
	});
});
