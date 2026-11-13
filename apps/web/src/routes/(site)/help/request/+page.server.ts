import { error } from '@sveltejs/kit';
import { handleForm } from '#lib/server/actions.ts';
import { assistanceSchema } from '#lib/server/forms.ts';
import { loadRoutePage } from '#lib/server/page.ts';
import { saveAssistanceRequest } from '#lib/server/submissions.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const page = await loadRoutePage('/help');
	return { page: { ...page, path: '/help/request', title: 'Request help' } };
};

export const actions: Actions = {
	default: async (event) => {
		const db = event.platform?.env.DB;
		if (!db) error(503, 'Requests are temporarily unavailable');
		return handleForm(event, assistanceSchema, (data, locale) =>
			saveAssistanceRequest(db, data, locale)
		);
	}
};
