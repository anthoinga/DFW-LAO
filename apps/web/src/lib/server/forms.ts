import { z } from 'zod';
import { ASSISTANCE_PROGRAMS, TSHIRT_SIZES } from '#lib/forms-constants.ts';

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1);
const phone = z
	.string()
	.trim()
	.regex(/^[\d\s()+.-]{7,20}$/, 'Enter a valid phone number');
const checkbox = z
	.union([z.literal('on'), z.literal('true'), z.boolean()])
	.optional()
	.transform((v) => v === 'on' || v === 'true' || v === true);

export const assistanceSchema = z
	.object({
		firstName: required(80),
		lastName: required(80),
		email: z.email().max(200).optional().or(z.literal('')),
		phone: phone.optional().or(z.literal('')),
		programs: z.array(z.enum(ASSISTANCE_PROGRAMS)).min(1, 'Choose at least one'),
		details: text(2000).optional(),
		preferredLanguage: z.enum(['en', 'lo']).default('en'),
		consent: checkbox.refine(Boolean, 'Consent is required')
	})
	.refine((v) => v.email || v.phone, {
		message: 'Provide an email or phone number',
		path: ['email']
	});

export const childSchema = z.object({
	firstName: required(80),
	lastName: required(80),
	age: z.coerce.number().int().min(6).max(18),
	tshirtSize: z.enum(TSHIRT_SIZES),
	allergiesMedical: text(1000).optional()
});

export const campRegistrationSchema = z.object({
	children: z.array(childSchema).min(1).max(8),
	parentName: required(120),
	parentEmail: z.email().max(200),
	parentPhone: phone,
	emergencyName: required(120),
	emergencyPhone: phone,
	volunteerInterest: checkbox,
	comments: text(2000).optional(),
	photoRelease: checkbox,
	liabilityConsent: checkbox.refine(Boolean, 'Consent is required')
});

export const contactSchema = z.object({
	name: required(120),
	email: z.email().max(200),
	subject: text(200).optional(),
	message: required(5000)
});

export const newsletterSchema = z.object({ name: text(120).optional(), email: z.email().max(200) });

export const volunteerSchema = z.object({
	name: required(120),
	email: z.email().max(200),
	interests: z.array(text(60)).max(10).default([]),
	message: text(2000).optional()
});

/**
 * FormData → plain object. `children.0.firstName` style keys become arrays of objects;
 * repeated keys (checkbox groups) become arrays.
 */
export function formToObject(form: FormData): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, raw] of form.entries()) {
		if (typeof raw !== 'string' || key.startsWith('cf-turnstile')) continue;
		const nested = key.match(/^(\w+)\.(\d+)\.(\w+)$/);
		if (nested) {
			const [, list, index, field] = nested;
			const arr = (out[list] ??= []) as Record<string, string>[];
			(arr[Number(index)] ??= {})[field] = raw;
			continue;
		}
		if (key.endsWith('[]')) {
			const name = key.slice(0, -2);
			((out[name] ??= []) as string[]).push(raw);
			continue;
		}
		out[key] = raw;
	}
	for (const value of Object.values(out))
		if (Array.isArray(value)) value.splice(0, value.length, ...value.filter(Boolean));
	return out;
}
