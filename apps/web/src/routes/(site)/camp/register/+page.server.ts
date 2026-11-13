import { error } from '@sveltejs/kit';
import { handleForm } from '#lib/server/actions.ts';
import { campRegistrationSchema } from '#lib/server/forms.ts';
import { loadRoutePage } from '#lib/server/page.ts';
import { saveCampRegistration } from '#lib/server/submissions.ts';
import { getCampSeason } from '#lib/sanity/content.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [page, season] = await Promise.all([loadRoutePage('/camp'), getCampSeason()]);
	return {
		page: { ...page, path: '/camp/register', title: 'Camp registration' },
		season: season ? { year: season.year, open: Boolean(season.registrationOpen) } : null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const season = await getCampSeason();
		if (!season?.registrationOpen) error(403, 'Registration is closed');
		const db = event.platform?.env.DB;
		if (!db) error(503, 'Registration is temporarily unavailable');
		return handleForm(event, campRegistrationSchema, (data, locale) =>
			saveCampRegistration(db, data, season.year, locale)
		);
	}
};
