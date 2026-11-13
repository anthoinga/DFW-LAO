import { accessibleImage } from './objects/accessibleImage';
import { i18nMeta } from './objects/i18nMeta';
import { link } from './objects/link';
import { seo } from './objects/seo';
import { i18nGlossary } from './documents/i18nGlossary';
import { orgFacts } from './documents/orgFacts';
import { siteSettings } from './documents/siteSettings';
import { campSeason, event, faq, linkCard, page, redirect, teamMember } from './documents/content';
import { inboxTypes } from './inbox';

export const singletons = ['siteSettings', 'orgFacts', 'i18nGlossary'] as const;

export const contentTypes = [
	accessibleImage,
	i18nMeta,
	link,
	seo,
	siteSettings,
	orgFacts,
	i18nGlossary,
	page,
	campSeason,
	event,
	teamMember,
	faq,
	linkCard,
	redirect
];

export { inboxTypes };
