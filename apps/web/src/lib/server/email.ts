import { env } from './env.ts';

type Mail = { to: string; subject: string; text: string; replyTo?: string };

/** Sends through Resend's HTTP API. No-ops (returns false) when no key is configured. */
export async function sendMail({ to, subject, text, replyTo }: Mail): Promise<boolean> {
	const key = env.RESEND_API_KEY;
	if (!key) return false;
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
		body: JSON.stringify({
			from: env.MAIL_FROM,
			to,
			subject,
			text,
			reply_to: replyTo
		})
	});
	return res.ok;
}

export const notifyOrg = (subject: string, text: string, replyTo?: string) =>
	sendMail({ to: env.NOTIFY_EMAIL, subject, text, replyTo });
