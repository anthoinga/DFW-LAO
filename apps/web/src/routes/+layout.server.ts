import { getSite } from '#lib/sanity/content.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => ({ site: await getSite() });
