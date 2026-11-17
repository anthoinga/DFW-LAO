import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import cloudflare from '@sveltejs/adapter-cloudflare';
import vercel from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Production runs on Cloudflare; Vercel builds (which set VERCEL=1) are design previews.
			adapter: process.env.VERCEL ? vercel() : cloudflare()
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// English at the root, Lao under /lo. No automatic redirects: language is explicit in the URL.
			strategy: ['url', 'baseLocale'],
			urlPatterns: [
				{
					pattern: '/:path(.*)?',
					localized: [
						['lo', '/lo/:path(.*)?'],
						['en', '/:path(.*)?']
					]
				}
			]
		})
	],
	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
