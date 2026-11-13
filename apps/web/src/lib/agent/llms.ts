import { SITE_URL, type Locale } from '#lib/config.ts';
import { localePath, t } from '#lib/i18n/index.ts';
import { getSite } from '#lib/sanity/content.ts';
import { allDocuments } from './documents';

/** Markdown twin URL for a page path (`/` → `/index.md`). */
export const markdownUrl = (path: string, locale: Locale) =>
	`${SITE_URL}${localePath(path === '/' ? '/index' : path, locale)}.md`;

/** llms.txt: summary, canonical facts and an index of Markdown pages (llmstxt.org). */
export async function llmsTxt(locale: Locale): Promise<string> {
	const [{ settings, facts }, docs] = await Promise.all([getSite(), allDocuments(locale)]);
	const other =
		locale === 'en'
			? { label: 'ລາວ (Lao)', path: '/lo/llms.txt' }
			: { label: 'English', path: '/llms.txt' };
	return [
		`# ${settings.name}`,
		'',
		`> ${t(facts.summary, locale) ?? ''}`,
		'',
		`- Founded: ${facts.foundedYear}`,
		`- Status: ${facts.nonprofitStatus} nonprofit`,
		`- Service area: ${t(facts.serviceArea, locale) ?? ''}`,
		`- Contact: ${settings.email} · ${settings.phone}`,
		'',
		'## Pages',
		'',
		...docs.map((d) => `- [${d.title}](${markdownUrl(d.path, locale)})`),
		'',
		'## Machine access',
		'',
		`- [Full text](${SITE_URL}${localePath('/llms-full.txt', locale)}): every page in one file`,
		`- [JSON API](${SITE_URL}/api/v1): read-only, no key required`,
		`- [MCP server](${SITE_URL}/mcp): streamable HTTP, read-only tools`,
		'',
		'## Optional',
		'',
		`- [${other.label}](${SITE_URL}${other.path})`,
		''
	].join('\n');
}

export async function llmsFullTxt(locale: Locale): Promise<string> {
	const docs = await allDocuments(locale);
	return (
		docs
			.map((d) => `${d.markdown}\n\nSource: ${SITE_URL}${localePath(d.path, locale)}`)
			.join('\n\n---\n\n') + '\n'
	);
}
