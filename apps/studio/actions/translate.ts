import type { DocumentActionComponent, DocumentBadgeComponent } from 'sanity';
import { useDocumentOperation } from 'sanity';

/**
 * Requests a fresh Lao translation. Publishing triggers the translation webhook,
 * which re-translates every field when `i18nMeta.forceAt` is newer than `translatedAt`.
 */
export const translateAction: DocumentActionComponent = (props) => {
	const { patch, publish } = useDocumentOperation(props.id, props.type);
	return {
		label: 'Translate to Lao',
		tone: 'primary',
		disabled: Boolean(publish.disabled) && publish.disabled !== 'ALREADY_PUBLISHED',
		onHandle: () => {
			patch.execute([{ set: { 'i18nMeta.forceAt': new Date().toISOString() } }]);
			publish.execute();
			props.onComplete();
		}
	};
};

const labels: Record<
	string,
	{ label: string; color: 'primary' | 'success' | 'warning' | 'danger' }
> = {
	pending: { label: 'Lao: pending', color: 'warning' },
	machine: { label: 'Lao: machine', color: 'primary' },
	reviewed: { label: 'Lao: reviewed', color: 'success' },
	'needs-review': { label: 'Lao: needs review', color: 'warning' },
	error: { label: 'Lao: error', color: 'danger' }
};

export const translationBadge: DocumentBadgeComponent = (props) => {
	const doc = (props.published ?? props.draft) as { i18nMeta?: { status?: string } } | null;
	const status = doc?.i18nMeta?.status;
	return status && labels[status] ? labels[status] : null;
};
