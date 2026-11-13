import { loadRoutePage } from '#lib/server/page.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => loadRoutePage('/about');
