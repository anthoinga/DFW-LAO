import { describe, expect, it } from 'vitest';
import { LEGACY_REDIRECTS, resolveRedirect } from './redirects';

describe('resolveRedirect', () => {
	it('maps every legacy URL', () => {
		for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
			expect(resolveRedirect(from)).toBe(to);
		}
	});

	it('ignores trailing slashes and case', () => {
		expect(resolveRedirect('/Our-Team/')).toBe('/about');
	});

	it('prefers CMS overrides', () => {
		expect(resolveRedirect('/dfw', { '/dfw': '/events' })).toBe('/events');
	});

	it('leaves current routes alone', () => {
		expect(resolveRedirect('/about')).toBeUndefined();
		expect(resolveRedirect('/camp')).toBeUndefined();
	});
});
