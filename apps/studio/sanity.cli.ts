import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: {
		projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me',
		dataset: process.env.SANITY_STUDIO_DATASET || 'production'
	},
	studioHost: 'dfw-lao-heritage',
	typegen: {
		path: '../web/src/**/*.{ts,svelte}',
		schema: 'schema.json',
		generates: '../web/src/lib/sanity/types.ts'
	}
});
