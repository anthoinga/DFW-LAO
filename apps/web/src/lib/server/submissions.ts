import type { z } from 'zod';
import { sanityWriter } from '#lib/sanity/client.ts';
import type { assistanceSchema, campRegistrationSchema } from './forms';
import { notifyOrg, sendMail } from './email';

/** How long sensitive submissions are kept before automatic deletion. */
export const RETENTION_DAYS = 365;

const purgeAfter = () => new Date(Date.now() + RETENTION_DAYS * 86_400_000).toISOString();

async function purgeExpired(db: D1Database) {
	const now = new Date().toISOString();
	await db.batch([
		db.prepare('DELETE FROM assistance_requests WHERE purge_after < ?').bind(now),
		db
			.prepare(
				'DELETE FROM camp_children WHERE registration_id IN (SELECT id FROM camp_registrations WHERE purge_after < ?)'
			)
			.bind(now),
		db.prepare('DELETE FROM camp_registrations WHERE purge_after < ?').bind(now)
	]);
}

export async function saveAssistanceRequest(
	db: D1Database,
	data: z.infer<typeof assistanceSchema>,
	locale: string
) {
	const id = crypto.randomUUID();
	await db
		.prepare(
			`INSERT INTO assistance_requests (id, locale, first_name, last_name, email, phone, programs, details, preferred_language, consent_at, purge_after)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			id,
			locale,
			data.firstName,
			data.lastName,
			data.email || null,
			data.phone || null,
			JSON.stringify(data.programs),
			data.details ?? null,
			data.preferredLanguage,
			new Date().toISOString(),
			purgeAfter()
		)
		.run();
	await purgeExpired(db);
	// Notification carries only what's needed to follow up; full details stay in the admin area.
	await notifyOrg(
		'New community help request',
		`${data.firstName} ${data.lastName} asked for help with: ${data.programs.join(', ')}.\nPreferred language: ${data.preferredLanguage}.\nReview it in the admin area.`
	);
	return id;
}

export async function saveCampRegistration(
	db: D1Database,
	data: z.infer<typeof campRegistrationSchema>,
	seasonYear: number,
	locale: string
) {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();
	await db.batch([
		db
			.prepare(
				`INSERT INTO camp_registrations (id, locale, season_year, parent_name, parent_email, parent_phone, emergency_name, emergency_phone, volunteer_interest, comments, photo_release, liability_consent_at, purge_after)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				locale,
				seasonYear,
				data.parentName,
				data.parentEmail,
				data.parentPhone,
				data.emergencyName,
				data.emergencyPhone,
				data.volunteerInterest ? 1 : 0,
				data.comments ?? null,
				data.photoRelease ? 1 : 0,
				now,
				purgeAfter()
			),
		...data.children.map((child) =>
			db
				.prepare(
					'INSERT INTO camp_children (id, registration_id, first_name, last_name, age, tshirt_size, allergies_medical) VALUES (?, ?, ?, ?, ?, ?, ?)'
				)
				.bind(
					crypto.randomUUID(),
					id,
					child.firstName,
					child.lastName,
					child.age,
					child.tshirtSize,
					child.allergiesMedical ?? null
				)
		)
	]);
	await purgeExpired(db);
	const names = data.children.map((c) => c.firstName).join(', ');
	await notifyOrg(
		`Camp ${seasonYear} registration: ${data.children.length} camper(s)`,
		`${data.parentName} registered ${names}. Review details in the admin area.`,
		data.parentEmail
	);
	await sendMail({
		to: data.parentEmail,
		subject: `DFW Lao Heritage Camp ${seasonYear}: registration received`,
		text: `Thank you, ${data.parentName}. We received your registration for ${names}. We'll be in touch with next steps.`
	});
	return id;
}

/** Low-sensitivity submissions go to the private Sanity `submissions` dataset (Studio Inbox). */
export async function saveInboxSubmission(
	type: 'contactMessage' | 'volunteerInterest' | 'newsletterSubscriber',
	data: Record<string, unknown>,
	locale: string
) {
	const client = sanityWriter('submissions');
	if (!client) return false;
	await client.create({ _type: type, ...data, locale, receivedAt: new Date().toISOString() });
	return true;
}
