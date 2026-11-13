/**
 * Finds translatable fields in a Sanity document. A field is translatable when it is an
 * internationalized array (items keyed by language) with an English value.
 */

export type I18nItem = { _key: string; _type: string; value?: unknown };
export type Span = { _type: 'span'; _key: string; text: string; marks?: string[] };
export type Block = { _type: 'block'; _key: string; children?: Span[]; [k: string]: unknown };

export type TranslatableField = {
	/** Sanity patch path, e.g. `title` or `sections[_key=="a1"].heading`. */
	path: string;
	/** `_type` of the English array item, reused for the Lao item. */
	itemType: string;
	en: unknown;
	lo?: unknown;
};

/** A unit of text sent for translation. Portable Text is split per span to preserve structure. */
export type TextUnit = { id: string; text: string };

const isI18nArray = (value: unknown): value is I18nItem[] =>
	Array.isArray(value) &&
	value.length > 0 &&
	value.every((v) => v && typeof v === 'object' && typeof v._key === 'string' && 'value' in v) &&
	value.some((v) => v._key === 'en');

const SKIP = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt', 'i18nMeta', 'slug']);

export function collectFields(doc: Record<string, unknown>): TranslatableField[] {
	const out: TranslatableField[] = [];
	const walk = (value: unknown, path: string) => {
		if (isI18nArray(value)) {
			const en = value.find((v) => v._key === 'en');
			if (en?.value != null && en.value !== '') {
				out.push({
					path,
					itemType: en._type,
					en: en.value,
					lo: value.find((v) => v._key === 'lo')?.value
				});
			}
			return;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === 'object' && typeof item._key === 'string') {
					walk(item, `${path}[_key=="${item._key}"]`);
				}
			}
			return;
		}
		if (value && typeof value === 'object') {
			for (const [key, child] of Object.entries(value)) {
				if (SKIP.has(key) || key.startsWith('_')) continue;
				walk(child, path ? `${path}.${key}` : key);
			}
		}
	};
	walk(doc, '');
	return out;
}

const isBlocks = (value: unknown): value is Block[] =>
	Array.isArray(value) && value.every((b) => b && typeof b === 'object' && '_type' in b);

export function toUnits(field: TranslatableField): TextUnit[] {
	if (typeof field.en === 'string') return [{ id: field.path, text: field.en }];
	if (isBlocks(field.en)) {
		return field.en.flatMap((block) =>
			block._type === 'block'
				? (block.children ?? [])
						.filter((s) => s.text?.trim())
						.map((s) => ({ id: `${field.path}::${block._key}::${s._key}`, text: s.text }))
				: []
		);
	}
	return [];
}

/** Rebuilds the Lao value from translated units, keeping marks, links and block structure. */
export function fromUnits(field: TranslatableField, translations: Map<string, string>): unknown {
	if (typeof field.en === 'string') return translations.get(field.path) ?? field.en;
	if (isBlocks(field.en)) {
		return field.en.map((block) =>
			block._type === 'block'
				? {
						...block,
						children: (block.children ?? []).map((s) => ({
							...s,
							text: translations.get(`${field.path}::${block._key}::${s._key}`) ?? s.text
						}))
					}
				: block
		);
	}
	return field.en;
}

export async function hashValue(value: unknown): Promise<string> {
	const data = new TextEncoder().encode(JSON.stringify(value));
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
	return Array.from(digest.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}
