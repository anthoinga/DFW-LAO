import { describe, expect, it } from 'vitest';
import { toMarkdown, toPlainText } from './portable-text';

const blocks = [
	{ _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Camp' }] },
	{
		_type: 'block',
		style: 'normal',
		markDefs: [{ _key: 'l1', _type: 'link', href: '/camp/register' }],
		children: [
			{ _type: 'span', text: 'Ages 6–18. ' },
			{ _type: 'span', text: 'Register', marks: ['strong', 'l1'] }
		]
	},
	{ _type: 'block', listItem: 'bullet', level: 1, children: [{ _type: 'span', text: 'Music' }] },
	{ _type: 'block', listItem: 'bullet', level: 1, children: [{ _type: 'span', text: 'Dance' }] }
];

describe('portable text', () => {
	it('renders markdown', () => {
		expect(toMarkdown(blocks)).toBe(
			'## Camp\n\nAges 6–18. [**Register**](/camp/register)\n\n- Music\n- Dance'
		);
	});

	it('renders plain text', () => {
		expect(toPlainText(blocks)).toContain('Ages 6–18. Register');
	});
});
