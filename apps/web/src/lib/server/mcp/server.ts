import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { publicData } from '#lib/agent/data.ts';
import type { Locale } from '#lib/config.ts';

const lang = z
	.enum(['en', 'lo'])
	.default('en')
	.describe('Response language: en (English) or lo (Lao)');
const readOnly = { readOnlyHint: true, openWorldHint: false } as const;
const asText = (data: unknown) => ({
	content: [
		{ type: 'text' as const, text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }
	]
});

/** A fresh, stateless MCP server exposing read-only public data. */
export function createMcpServer() {
	const server = new McpServer({ name: 'dfw-lao-heritage', version: '1.0.0' });

	server.registerTool(
		'get_org_info',
		{
			title: 'Organization info',
			description:
				'Mission, nonprofit status, contact details and ways to give for DFW Lao Heritage.',
			inputSchema: { lang },
			annotations: readOnly
		},
		async ({ lang }) => asText(await publicData.org(lang as Locale))
	);
	server.registerTool(
		'get_camp_season',
		{
			title: 'Summer camp',
			description:
				'Current Lao arts & culture summer camp: dates, location, ages, tuition, curriculum and whether registration is open.',
			inputSchema: { lang },
			annotations: readOnly
		},
		async ({ lang }) =>
			asText(
				(await publicData.campSeason(lang as Locale)) ?? 'No camp season has been announced yet.'
			)
	);
	server.registerTool(
		'list_events',
		{
			title: 'Events',
			description: 'Upcoming and past events with dates, venues and links.',
			inputSchema: { lang },
			annotations: readOnly
		},
		async ({ lang }) => asText(await publicData.events(lang as Locale))
	);
	server.registerTool(
		'list_team',
		{
			title: 'Board and team',
			description: 'Board members and their roles.',
			inputSchema: { lang },
			annotations: readOnly
		},
		async ({ lang }) => asText(await publicData.team(lang as Locale))
	);
	server.registerTool(
		'get_faq',
		{
			title: 'FAQ',
			description: 'Frequently asked questions about camp, community help and support.',
			inputSchema: { lang },
			annotations: readOnly
		},
		async ({ lang }) => asText(await publicData.faq(lang as Locale))
	);
	server.registerTool(
		'get_page',
		{
			title: 'Page',
			description: 'A site page as Markdown, e.g. /camp, /help, /support, /events/<slug>.',
			inputSchema: { path: z.string().startsWith('/'), lang },
			annotations: readOnly
		},
		async ({ path, lang }) =>
			asText((await publicData.page(path, lang as Locale))?.markdown ?? 'Page not found.')
	);
	server.registerTool(
		'search_site',
		{
			title: 'Search',
			description: 'Keyword search across all public pages.',
			inputSchema: { query: z.string().min(2), lang },
			annotations: readOnly
		},
		async ({ query, lang }) => asText(await publicData.search(query, lang as Locale))
	);

	return server;
}

export async function handleMcpRequest(request: Request): Promise<Response> {
	const server = createMcpServer();
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true
	});
	await server.connect(transport);
	return transport.handleRequest(request);
}
