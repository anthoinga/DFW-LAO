import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { contentTypes, inboxTypes, singletons } from './schemas';
import { blockContentField } from './schemas/objects/blockContent';
import { inboxStructure, structure } from './structure';
import { translateAction, translationBadge } from './actions/translate';
import { dataset, inboxDataset, languages, previewUrl, projectId } from './env';

const translatable = new Set([
	'page',
	'campSeason',
	'event',
	'teamMember',
	'faq',
	'linkCard',
	'orgFacts'
]);

const i18n = internationalizedArray({
	languages,
	defaultLanguages: ['en'],
	fieldTypes: ['string', 'text', blockContentField],
	buttonLocations: ['field']
});

export default defineConfig([
	{
		name: 'content',
		title: 'DFW Lao Heritage',
		basePath: '/content',
		projectId,
		dataset,
		plugins: [
			structureTool({ structure }),
			presentationTool({
				previewUrl: { initial: previewUrl, previewMode: { enable: '/api/preview/enable' } }
			}),
			i18n,
			visionTool()
		],
		schema: {
			types: contentTypes,
			templates: (templates) =>
				templates.filter((t) => !(singletons as readonly string[]).includes(t.schemaType))
		},
		document: {
			actions: (prev, ctx) => {
				const base = (singletons as readonly string[]).includes(ctx.schemaType)
					? prev.filter((a) => ['publish', 'discardChanges', 'restore'].includes(a.action ?? ''))
					: prev;
				return translatable.has(ctx.schemaType) ? [...base, translateAction] : base;
			},
			badges: (prev, ctx) => (translatable.has(ctx.schemaType) ? [...prev, translationBadge] : prev)
		}
	},
	{
		name: 'inbox',
		title: 'Inbox',
		basePath: '/inbox',
		projectId,
		dataset: inboxDataset,
		plugins: [structureTool({ structure: inboxStructure })],
		schema: { types: inboxTypes },
		document: { actions: (prev) => prev.filter((a) => a.action === 'delete') }
	}
]);
