import { handleForm } from '#lib/server/actions.ts';
import { volunteerSchema } from '#lib/server/forms.ts';
import { loadRoutePage } from '#lib/server/page.ts';
import { notifyOrg } from '#lib/server/email.ts';
import { saveInboxSubmission } from '#lib/server/submissions.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => loadRoutePage('/support');

export const actions: Actions = {
	volunteer: (event) =>
		handleForm(event, volunteerSchema, async (data, locale) => {
			await saveInboxSubmission('volunteerInterest', data, locale);
			await notifyOrg(
				'New volunteer',
				`${data.name} <${data.email}>\n${data.interests.join(', ')}\n\n${data.message ?? ''}`,
				data.email
			);
		})
};
