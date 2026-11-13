import { describe, expect, it } from 'vitest';
import { assistanceSchema, campRegistrationSchema, formToObject } from './forms';

describe('formToObject', () => {
	it('builds nested children and checkbox arrays', () => {
		const form = new FormData();
		form.append('parentName', 'Ana');
		form.append('children.0.firstName', 'Kai');
		form.append('children.1.firstName', 'Mai');
		form.append('programs[]', 'food');
		form.append('programs[]', 'immigration');
		form.append('cf-turnstile-response', 'token');
		expect(formToObject(form)).toEqual({
			parentName: 'Ana',
			children: [{ firstName: 'Kai' }, { firstName: 'Mai' }],
			programs: ['food', 'immigration']
		});
	});
});

describe('campRegistrationSchema', () => {
	const valid = {
		children: [{ firstName: 'Kai', lastName: 'S', age: '9', tshirtSize: 'YM' }],
		parentName: 'Ana S',
		parentEmail: 'ana@example.com',
		parentPhone: '682-555-0100',
		emergencyName: 'Bo S',
		emergencyPhone: '682-555-0101',
		liabilityConsent: 'on'
	};

	it('accepts a multi-child registration', () => {
		const result = campRegistrationSchema.safeParse({
			...valid,
			children: [
				...valid.children,
				{ firstName: 'Mai', lastName: 'S', age: '12', tshirtSize: 'AS' }
			]
		});
		expect(result.success).toBe(true);
		expect(result.data?.photoRelease).toBe(false);
	});

	it('rejects ages outside 6–18 and missing consent', () => {
		const result = campRegistrationSchema.safeParse({
			...valid,
			children: [{ ...valid.children[0], age: '4' }],
			liabilityConsent: undefined
		});
		expect(result.success).toBe(false);
	});
});

describe('assistanceSchema', () => {
	it('requires a way to reach the person', () => {
		const result = assistanceSchema.safeParse({
			firstName: 'A',
			lastName: 'B',
			programs: ['food'],
			consent: 'on'
		});
		expect(result.success).toBe(false);
	});
});
