import { describe, expect, it } from 'vitest';
import en from '../../../messages/en.json';
import lo from '../../../messages/lo.json';

describe('interface strings', () => {
	it('every English string has a Lao translation (run `pnpm i18n:ui`)', () => {
		const missing = Object.keys(en).filter((k) => !(k in lo) || !(lo as Record<string, string>)[k]);
		expect(missing).toEqual([]);
	});

	it('Lao has no stale keys', () => {
		expect(Object.keys(lo).filter((k) => !(k in en))).toEqual([]);
	});
});
