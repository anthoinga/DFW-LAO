import { handleForm } from '#lib/server/actions.ts';
import { contactSchema, newsletterSchema } from '#lib/server/forms.ts';
import { loadRoutePage } from '#lib/server/page.ts';
import { notifyOrg } from '#lib/server/email.ts';
import { saveInboxSubmission } from '#lib/server/submissions.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => loadRoutePage('/contact');

export const actions: Actions = {
	contact: (event) =>
		handleForm(event, contactSchema, async (data, locale) => {
			await saveInboxSubmission('contactMessage', data, locale);
			await notifyOrg(
				`Website message: ${data.subject || 'New message'}`,
				`${data.name} <${data.email}>\n\n${data.message}`,
				data.email
			);
		}),
	newsletter: (event) =>
		handleForm(event, newsletterSchema, (data, locale) =>
			saveInboxSubmission('newsletterSubscriber', data, locale)
		)
};
