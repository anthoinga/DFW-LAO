import { fail, type RequestEvent } from '@sveltejs/kit';
import type { z } from 'zod';
import { getLocale } from '#lib/paraglide/runtime.js';
import { formToObject } from './forms';
import { verifyTurnstile } from './security';

/** Shared form action flow: Turnstile → schema validation → persist. */
export async function handleForm<S extends z.ZodType>(
	event: RequestEvent,
	schema: S,
	persist: (data: z.infer<S>, locale: string) => Promise<unknown>
) {
	const form = await event.request.formData();
	const values = formToObject(form);
	const human = await verifyTurnstile(form.get('cf-turnstile-response'), event.getClientAddress());
	if (!human)
		return fail(400, {
			values,
			errors: { form: ['Please complete the verification and try again.'] }
		});

	const parsed = schema.safeParse(values);
	if (!parsed.success) {
		const errors: Record<string, string[]> = {};
		for (const issue of parsed.error.issues)
			(errors[issue.path.join('.') || 'form'] ??= []).push(issue.message);
		return fail(400, { values, errors });
	}
	await persist(parsed.data, getLocale());
	return { success: true };
}
