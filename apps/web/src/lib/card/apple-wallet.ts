import { trackedUrl } from './qr';
import type { PassCard } from './types';

export type AppleWalletConfig = { passTypeId: string; teamId: string };

/**
 * pass.json for an Apple Wallet generic pass. Signing (PKCS#7 with the Pass Type ID certificate)
 * and packaging into a .pkpass are enabled once the Apple Developer account and certificates exist;
 * until then the route reports the feature as disabled.
 */
export function applePassJson(config: AppleWalletConfig, card: PassCard) {
	return {
		formatVersion: 1,
		passTypeIdentifier: config.passTypeId,
		teamIdentifier: config.teamId,
		serialNumber: `dfw-lao-${card.id}`,
		organizationName: card.org,
		description: `${card.name} — ${card.org}`,
		logoText: card.org,
		foregroundColor: 'rgb(255, 255, 255)',
		backgroundColor: 'rgb(31, 42, 68)',
		generic: {
			primaryFields: [{ key: 'name', label: card.title ?? '', value: card.name }],
			secondaryFields: [{ key: 'org', label: 'Organization', value: card.org }],
			backFields: [{ key: 'link', label: 'Card', value: card.url }]
		},
		barcodes: [
			{
				format: 'PKBarcodeFormatQR',
				message: trackedUrl(card.url, 'wallet', card.id),
				messageEncoding: 'iso-8859-1',
				altText: card.url.replace('https://', '')
			}
		]
	};
}
