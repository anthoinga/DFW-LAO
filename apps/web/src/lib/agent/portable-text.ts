type Span = { _type: 'span'; text: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; href?: string };
export type Block = {
	_type: string;
	style?: string;
	listItem?: 'bullet' | 'number';
	level?: number;
	children?: Span[];
	markDefs?: MarkDef[];
};

const DECORATORS: Record<string, [string, string]> = {
	strong: ['**', '**'],
	em: ['_', '_'],
	code: ['`', '`']
};

function spanToMarkdown(span: Span, defs: MarkDef[]): string {
	let text = span.text ?? '';
	if (!text) return '';
	for (const mark of span.marks ?? []) {
		const deco = DECORATORS[mark];
		if (deco) text = `${deco[0]}${text}${deco[1]}`;
		const def = defs.find((d) => d._key === mark);
		if (def?._type === 'link' && def.href) text = `[${text}](${def.href})`;
	}
	return text;
}

/** Portable Text → Markdown (headings, quotes, lists, bold/italic/code, links). */
export function toMarkdown(blocks: unknown[] | undefined | null): string {
	if (!Array.isArray(blocks)) return '';
	const out: string[] = [];
	let prevList = false;
	for (const raw of blocks as Block[]) {
		if (raw?._type !== 'block') continue;
		const text = (raw.children ?? []).map((s) => spanToMarkdown(s, raw.markDefs ?? [])).join('');
		if (raw.listItem) {
			const indent = '  '.repeat(Math.max(0, (raw.level ?? 1) - 1));
			out.push(`${indent}${raw.listItem === 'number' ? '1.' : '-'} ${text}`);
			prevList = true;
			continue;
		}
		if (prevList) out.push('');
		prevList = false;
		const prefix =
			raw.style === 'h2'
				? '## '
				: raw.style === 'h3'
					? '### '
					: raw.style === 'blockquote'
						? '> '
						: '';
		out.push(prefix + text, '');
	}
	return out
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** Plain text (for prompts, hashes and meta fallbacks). */
export function toPlainText(blocks: unknown[] | undefined | null): string {
	if (!Array.isArray(blocks)) return '';
	return (blocks as Block[])
		.filter((b) => b?._type === 'block')
		.map((b) => (b.children ?? []).map((s) => s.text).join(''))
		.join('\n\n');
}
