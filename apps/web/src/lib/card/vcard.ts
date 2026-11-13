export type VCardInput = {
	name: string;
	org: string;
	title?: string;
	email?: string;
	phone?: string;
	url: string;
	note?: string;
	socials?: string[];
};

/** vCard 3.0 escaping: backslash, comma, semicolon, newline. */
const esc = (v: string) =>
	v.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 octets are folded per RFC 6350. */
const fold = (line: string) => {
	const parts: string[] = [];
	let rest = line;
	while (rest.length > 75) {
		parts.push(rest.slice(0, 75));
		rest = ' ' + rest.slice(75);
	}
	parts.push(rest);
	return parts.join('\r\n');
};

export function vcard(input: VCardInput): string {
	const [first, ...rest] = input.name.split(' ');
	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${esc(rest.join(' '))};${esc(first)};;;`,
		`FN:${esc(input.name)}`,
		`ORG:${esc(input.org)}`,
		input.title && `TITLE:${esc(input.title)}`,
		input.email && `EMAIL;TYPE=INTERNET:${esc(input.email)}`,
		input.phone && `TEL;TYPE=CELL:${esc(input.phone)}`,
		`URL:${esc(input.url)}`,
		...(input.socials ?? []).map((s) => `X-SOCIALPROFILE:${esc(s)}`),
		input.note && `NOTE:${esc(input.note)}`,
		'END:VCARD'
	].filter((l): l is string => Boolean(l));
	return lines.map(fold).join('\r\n') + '\r\n';
}
