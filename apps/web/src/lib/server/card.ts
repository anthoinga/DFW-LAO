import { LINKS_URL, SITE_URL, type Locale } from '#lib/config.ts';
import { localePath, t } from '#lib/i18n/index.ts';
import { activeLinks, getLinkCard, getSite, type Link } from '#lib/sanity/content.ts';
import { env } from './env.ts';

export type CardView = {
	id: string;
	kind: 'org' | 'person';
	name: string;
	role?: string;
	tagline?: string;
	url: string;
	links: { label: string; href: string; icon?: string }[];
	socials: { label: string; href: string; icon?: string }[];
	contact: { email?: string; phone?: string };
	org: string;
};

const fallbackLinks = (locale: Locale): Link[] => [
	{
		href: SITE_URL + localePath('/camp', locale),
		icon: 'camp',
		label: [
			{ _key: 'en', value: 'Summer camp' },
			{ _key: 'lo', value: 'ຄ່າຍລະດູຮ້ອນ' }
		]
	},
	{
		href: SITE_URL + localePath('/support', locale),
		icon: 'donate',
		label: [
			{ _key: 'en', value: 'Support us' },
			{ _key: 'lo', value: 'ສະໜັບສະໜູນພວກເຮົາ' }
		]
	},
	{
		href: SITE_URL + localePath('/help', locale),
		icon: 'help',
		label: [
			{ _key: 'en', value: 'Get help' },
			{ _key: 'lo', value: 'ຂໍຄວາມຊ່ວຍເຫຼືອ' }
		]
	},
	{
		href: SITE_URL + localePath('/', locale),
		icon: 'website',
		label: [
			{ _key: 'en', value: 'Website' },
			{ _key: 'lo', value: 'ເວັບໄຊ' }
		]
	}
];

/** Resolves the org card (`''`) or a personal card (`slug`) into what the card page renders. */
export async function loadCard(slug: string, locale: Locale): Promise<CardView | null> {
	const [site, doc] = await Promise.all([getSite(), getLinkCard(slug)]);
	if (!doc && slug) return null;

	const mapLink = (l: Link) => ({
		label: t(l.label, locale) ?? l.href,
		href: l.href,
		icon: l.icon
	});
	const isPerson = doc?.kind === 'person';
	const personal = isPerson && doc?.personalContact?.optIn ? doc.personalContact : undefined;

	return {
		id: slug || 'org',
		kind: isPerson ? 'person' : 'org',
		name: doc?.name ?? site.settings.name,
		role: t(doc?.role, locale),
		tagline: t(doc?.tagline, locale) ?? t(site.settings.tagline, locale),
		url: `${LINKS_URL}${localePath(slug ? `/${slug}` : '/', locale)}`,
		links: activeLinks(doc?.featuredLinks?.length ? doc.featuredLinks : fallbackLinks(locale)).map(
			mapLink
		),
		socials: (site.settings.socials ?? []).map(mapLink),
		contact: {
			email: personal?.email || site.settings.email,
			phone: personal?.phone || site.settings.phone
		},
		org: site.settings.name
	};
}

export const appleWalletEnabled = () => env.APPLE_WALLET_ENABLED;

export function googleWalletConfig(origin: string) {
	const issuerId = env.GOOGLE_WALLET_ISSUER_ID;
	const serviceAccountEmail = env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
	const privateKeyPem = env.GOOGLE_WALLET_PRIVATE_KEY;
	return issuerId && serviceAccountEmail && privateKeyPem
		? { issuerId, serviceAccountEmail, privateKeyPem, origin }
		: null;
}
