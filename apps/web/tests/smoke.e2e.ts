import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { LEGACY_REDIRECTS } from '../src/lib/server/redirects.ts';

const ROUTES = [
	'/',
	'/camp',
	'/camp/register',
	'/help',
	'/help/request',
	'/events',
	'/about',
	'/support',
	'/contact',
	'/agent',
	'/privacy',
	'/terms'
];

test.describe('site routes', () => {
	for (const route of ROUTES) {
		test(`${route} renders in English and Lao`, async ({ request }) => {
			const en = await request.get(route);
			expect(en.status()).toBe(200);
			const lo = await request.get(route === '/' ? '/lo' : `/lo${route}`);
			expect(lo.status()).toBe(200);
			expect(await lo.text()).toContain('lang="lo"');
		});
	}

	test('pages declare hreflang alternates and a Markdown twin', async ({ request }) => {
		const html = await (await request.get('/camp')).text();
		expect(html).toContain('hreflang="lo"');
		expect(html).toContain('hreflang="x-default"');
		expect(html).toContain('type="text/markdown"');
	});

	test('unknown pages return 404', async ({ request }) => {
		expect((await request.get('/does-not-exist')).status()).toBe(404);
	});
});

test.describe('legacy redirects', () => {
	for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
		test(`${from} → ${to}`, async ({ request }) => {
			const res = await request.get(from, { maxRedirects: 0 });
			expect(res.status()).toBe(301);
			expect(res.headers().location).toBe(to);
		});
	}
});

test.describe('search and agent endpoints', () => {
	test('robots.txt welcomes AI crawlers and blocks private areas', async ({ request }) => {
		const text = await (await request.get('/robots.txt')).text();
		expect(text).toContain('User-agent: ClaudeBot');
		expect(text).toContain('Disallow: /admin');
		expect(text).toContain('Sitemap: https://www.dallasfwlaoheritage.com/sitemap.xml');
	});

	test('sitemap lists both languages with hreflang pairs', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain('<loc>https://www.dallasfwlaoheritage.com/camp</loc>');
		expect(xml).toContain('<loc>https://www.dallasfwlaoheritage.com/lo/camp</loc>');
		expect(xml).toContain('hreflang="x-default"');
	});

	test('llms.txt and llms-full.txt', async ({ request }) => {
		const llms = await (await request.get('/llms.txt')).text();
		expect(llms).toMatch(/^# DFW Lao Heritage/);
		expect(llms).toContain('/camp.md');
		expect((await request.get('/lo/llms.txt')).status()).toBe(200);
		expect((await request.get('/llms-full.txt')).status()).toBe(200);
	});

	test('Markdown twins via .md and Accept header', async ({ request }) => {
		const md = await request.get('/camp.md');
		expect(md.headers()['content-type']).toContain('text/markdown');
		expect(await md.text()).toMatch(/^# /);
		const negotiated = await request.get('/support', { headers: { accept: 'text/markdown' } });
		expect(negotiated.headers()['content-type']).toContain('text/markdown');
	});

	test('JSON API', async ({ request }) => {
		const index = await (await request.get('/api/v1')).json();
		expect(index.resources.org).toContain('/api/v1/org');
		const org = await request.get('/api/v1/org');
		expect(org.headers()['access-control-allow-origin']).toBe('*');
		expect((await org.json()).phone).toBe('682-331-7779');
	});

	test('MCP server lists read-only tools', async ({ request }) => {
		const headers = {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream'
		};
		const init = await request.post('/mcp', {
			headers,
			data: {
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2025-06-18',
					capabilities: {},
					clientInfo: { name: 'smoke', version: '1' }
				}
			}
		});
		expect(init.status()).toBe(200);
		const list = await request.post('/mcp', {
			headers: { ...headers, 'mcp-protocol-version': '2025-06-18' },
			data: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }
		});
		const names = ((await list.json()).result.tools as { name: string }[]).map((t) => t.name);
		expect(names).toEqual(
			expect.arrayContaining(['get_org_info', 'get_camp_season', 'search_site'])
		);
	});

	test('chat is unavailable without an API key', async ({ request }) => {
		const res = await request.post('/api/chat', {
			data: { messages: [{ role: 'user', content: 'hi' }] }
		});
		expect(res.status()).toBe(503);
	});

	test('translation webhook rejects unsigned requests', async ({ request }) => {
		const res = await request.post('/api/i18n/translate', { data: { _id: 'x', _type: 'page' } });
		expect(res.status()).toBe(401);
	});

	test('card routes are not exposed on the main host', async ({ request }) => {
		expect((await request.get('/links')).status()).toBe(404);
	});
});

test.describe('digital card host', () => {
	const CARD = 'http://links.localhost:4173';

	test('org card renders with actions', async ({ page }) => {
		await page.goto(`${CARD}/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('DFW Lao Heritage');
		await expect(page.getByRole('link', { name: 'Save contact' })).toBeVisible();
	});

	test('vCard download, share mode and wallet flags', async ({ page }) => {
		await page.goto(`${CARD}/`);
		const vcf = await page.evaluate(async () => {
			const res = await fetch('/vcard');
			return { type: res.headers.get('content-type'), body: await res.text() };
		});
		expect(vcf.type).toContain('text/vcard');
		expect(vcf.body).toContain('TEL;TYPE=CELL:682-331-7779');

		const apple = await page.evaluate(async () => (await fetch('/wallet/apple')).status);
		expect(apple).toBe(404);

		await page.goto(`${CARD}/share`);
		await expect(page.locator('svg').first()).toBeVisible();
	});

	test('unknown personal card is a 404', async ({ page }) => {
		const res = await page.goto(`${CARD}/nobody`);
		expect(res?.status()).toBe(404);
	});
});

test.describe('accessibility', () => {
	for (const route of ['/', '/camp/register', '/help/request', '/agent']) {
		test(`${route} has no axe violations`, async ({ page }) => {
			await page.goto(route);
			const results = await new AxeBuilder({ page }).disableRules(['region']).analyze();
			expect(results.violations.map((v) => v.id)).toEqual([]);
		});
	}
});
