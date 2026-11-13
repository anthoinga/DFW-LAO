import { collectFields, fromUnits, hashValue, toUnits, type TextUnit } from './fields.ts';

export type Glossary = {
	styleNotes?: string;
	terms?: { en: string; lo?: string; note?: string }[];
};
export type Translator = (units: TextUnit[], glossary: Glossary) => Promise<Map<string, string>>;

type Meta = {
	status?: string;
	translatedAt?: string;
	forceAt?: string;
	hashes?: { _key?: string; path: string; hash: string; reviewed?: boolean }[];
};

export type TranslationPlan = {
	/** Sanity `set` operations: path → full internationalized array. */
	set: Record<string, unknown>;
	translated: number;
	skipped: number;
};

/**
 * Translates every English field whose source changed since the last run (or all fields when a
 * re-translation was requested). Reviewed Lao fields are kept unless their English source changed.
 * Returns null when there is nothing to do, so our own write-back never re-triggers translation.
 */
export async function planTranslation(
	doc: Record<string, unknown> & { i18nMeta?: Meta },
	translate: Translator,
	glossary: Glossary,
	now = new Date()
): Promise<TranslationPlan | null> {
	const meta = doc.i18nMeta ?? {};
	const force = Boolean(meta.forceAt && (!meta.translatedAt || meta.forceAt > meta.translatedAt));
	const previous = new Map((meta.hashes ?? []).map((h) => [h.path, h]));

	const fields = collectFields(doc);
	const hashes = await Promise.all(fields.map((f) => hashValue(f.en)));
	const todo = fields.filter((f, i) => {
		const prev = previous.get(f.path);
		if (prev?.reviewed && prev.hash === hashes[i] && f.lo != null) return false;
		return force || !prev || prev.hash !== hashes[i] || f.lo == null;
	});
	if (todo.length === 0) return null;

	const units = todo.flatMap(toUnits);
	const translations = units.length ? await translate(units, glossary) : new Map<string, string>();

	const set: Record<string, unknown> = {};
	for (const field of todo) {
		set[field.path] = [
			{ _key: 'en', _type: field.itemType, value: field.en },
			{ _key: 'lo', _type: field.itemType, value: fromUnits(field, translations) }
		];
	}
	const todoPaths = new Set(todo.map((f) => f.path));
	set.i18nMeta = {
		_type: 'i18nMeta',
		status: 'machine',
		translatedAt: now.toISOString(),
		forceAt: meta.forceAt,
		hashes: fields.map((f, i) => ({
			_key: hashes[i].slice(0, 8) + i,
			path: f.path,
			hash: hashes[i],
			reviewed: todoPaths.has(f.path) ? false : Boolean(previous.get(f.path)?.reviewed)
		}))
	};
	return { set, translated: todo.length, skipped: fields.length - todo.length };
}
