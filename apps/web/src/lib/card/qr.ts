import { renderSVG } from 'uqr';

export type Channel = 'qr' | 'nfc' | 'wallet' | 'share';

/** Card URL with attribution so analytics can tell channels and people apart. */
export function trackedUrl(url: string, src: Channel, person?: string) {
	const u = new URL(url);
	u.searchParams.set('src', src);
	if (person) u.searchParams.set('p', person);
	return u.toString();
}

export const qrSvg = (data: string) => renderSVG(data, { ecc: 'M', border: 2 });
