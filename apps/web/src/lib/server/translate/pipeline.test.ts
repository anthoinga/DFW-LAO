import { describe, expect, it, vi } from 'vitest';
import { collectFields, fromUnits, toUnits } from './fields.ts';
import { planTranslation, type Translator } from './pipeline.ts';

const doc = {
	_id: 'event-1',
	_type: 'event',
	slug: { current: 'camp-showcase' },
	title: [{ _key: 'en', _type: 'internationalizedArrayStringValue', value: 'Camp showcase' }],
	body: [
		{
			_key: 'en',
			_type: 'internationalizedArrayBlockContentValue',
			value: [
				{
					_type: 'block',
					_key: 'b1',
					style: 'normal',
					markDefs: [{ _key: 'l1', _type: 'link', href: '/camp' }],
					children: [
						{ _type: 'span', _key: 's1', text: 'Join us for ', marks: [] },
						{ _type: 'span', _key: 's2', text: 'the showcase', marks: ['l1'] }
					]
				}
			]
		}
	],
	sections: [
		{
			_key: 'sec1',
			_type: 'textSection',
			heading: [{ _key: 'en', _type: 'internationalizedArrayStringValue', value: 'When' }]
		}
	]
};

/** Applies Sanity-style `set` paths (`a.b`, `list[_key=="x"].c`) to a deep copy of the document. */
function applySet(doc: Record<string, unknown>, set: Record<string, unknown>) {
	const out = structuredClone(doc);
	for (const [path, value] of Object.entries(set)) {
		const parts = path.match(/[^.[\]]+|\[_key=="[^"]+"\]/g)!;
		let node: Record<string, unknown> | unknown[] = out;
		parts.forEach((part, i) => {
			const last = i === parts.length - 1;
			const keyMatch = part.match(/^\[_key=="(.+)"\]$/);
			if (keyMatch) {
				const item = (node as { _key: string }[]).find((x) => x._key === keyMatch[1]) as Record<
					string,
					unknown
				>;
				node = item;
				return;
			}
			if (last) (node as Record<string, unknown>)[part] = structuredClone(value);
			else node = (node as Record<string, unknown>)[part] as Record<string, unknown>;
		});
	}
	return out;
}

const fakeTranslator: Translator = async (units) =>
	new Map(units.map((u) => [u.id, `LO(${u.text})`]));

describe('collectFields', () => {
	it('finds nested internationalized fields with patch paths', () => {
		expect(collectFields(doc).map((f) => f.path)).toEqual([
			'title',
			'body',
			'sections[_key=="sec1"].heading'
		]);
	});
});

describe('portable text round trip', () => {
	it('translates spans and keeps marks and links', () => {
		const field = collectFields(doc).find((f) => f.path === 'body')!;
		const units = toUnits(field);
		expect(units).toHaveLength(2);
		const lo = fromUnits(field, new Map(units.map((u) => [u.id, `LO(${u.text})`]))) as {
			markDefs: unknown[];
			children: { text: string; marks: string[] }[];
		}[];
		expect(lo[0].children.map((c) => c.text)).toEqual(['LO(Join us for )', 'LO(the showcase)']);
		expect(lo[0].children[1].marks).toEqual(['l1']);
		expect(lo[0].markDefs).toEqual(doc.body[0].value[0].markDefs);
	});
});

describe('planTranslation', () => {
	it('translates everything on first run and records hashes', async () => {
		const plan = await planTranslation(doc, fakeTranslator, {});
		expect(plan?.translated).toBe(3);
		expect(plan?.set.title).toEqual([
			{ _key: 'en', _type: 'internationalizedArrayStringValue', value: 'Camp showcase' },
			{ _key: 'lo', _type: 'internationalizedArrayStringValue', value: 'LO(Camp showcase)' }
		]);
	});

	it('is a no-op when nothing changed (no webhook loop)', async () => {
		const first = await planTranslation(doc, fakeTranslator, {});
		const translated = applySet(doc, first!.set);
		const spy = vi.fn(fakeTranslator);
		expect(await planTranslation(translated, spy, {})).toBeNull();
		expect(spy).not.toHaveBeenCalled();
	});

	it('re-translates only changed fields and keeps reviewed ones', async () => {
		const first = await planTranslation(doc, fakeTranslator, {});
		const meta = first!.set.i18nMeta as { hashes: { path: string; reviewed: boolean }[] };
		meta.hashes.find((h) => h.path === 'sections[_key=="sec1"].heading')!.reviewed = true;
		const edited = {
			...applySet(doc, first!.set),
			title: [
				{ _key: 'en', _type: 'internationalizedArrayStringValue', value: 'Camp showcase 2027' },
				{ _key: 'lo', _type: 'internationalizedArrayStringValue', value: 'old' }
			]
		} as Record<string, unknown>;
		const spy = vi.fn(fakeTranslator);
		const plan = await planTranslation(edited, spy, {});
		expect(plan?.translated).toBe(1);
		expect(Object.keys(plan!.set)).toEqual(['title', 'i18nMeta']);
		const hashes = (plan!.set.i18nMeta as { hashes: { path: string; reviewed: boolean }[] }).hashes;
		expect(hashes.find((h) => h.path === 'sections[_key=="sec1"].heading')?.reviewed).toBe(true);
	});

	it('re-translates everything when forced', async () => {
		const first = await planTranslation(doc, fakeTranslator, {}, new Date('2026-01-01'));
		const forced = {
			...applySet(doc, first!.set),
			i18nMeta: { ...(first!.set.i18nMeta as object), forceAt: '2026-02-01T00:00:00.000Z' }
		} as Record<string, unknown>;
		const plan = await planTranslation(forced, fakeTranslator, {}, new Date('2026-02-02'));
		expect(plan?.translated).toBe(3);
	});
});
