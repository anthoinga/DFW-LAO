import { dev } from '$app/env';
import { error } from '@sveltejs/kit';
import { verifyAccess } from '#lib/server/security.ts';
import type { PageServerLoad } from './$types';

type Row = Record<string, string | number | null>;

/** Sensitive submissions. Protected by a Cloudflare Access policy and verified again here. */
export const load: PageServerLoad = async ({ request, platform, setHeaders }) => {
	const user = await verifyAccess(request);
	if (!user && !dev) error(403, 'Forbidden');
	setHeaders({ 'cache-control': 'private, no-store' });

	const db = platform?.env.DB;
	if (!db) return { user, assistance: [] as Row[], registrations: [] as Row[] };

	const [assistance, registrations] = await Promise.all([
		db.prepare('SELECT * FROM assistance_requests ORDER BY received_at DESC LIMIT 200').all<Row>(),
		db
			.prepare(
				`SELECT r.*, json_group_array(json_object('name', c.first_name || ' ' || c.last_name, 'age', c.age, 'tshirt', c.tshirt_size, 'medical', c.allergies_medical)) AS children
				 FROM camp_registrations r LEFT JOIN camp_children c ON c.registration_id = r.id
				 GROUP BY r.id ORDER BY r.received_at DESC LIMIT 200`
			)
			.all<Row>()
	]);
	return { user, assistance: assistance.results, registrations: registrations.results };
};
