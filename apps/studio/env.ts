export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me';
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
export const inboxDataset = 'submissions';
export const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:5173';
export const languages = [
	{ id: 'en', title: 'English' },
	{ id: 'lo', title: 'ລາວ (Lao)' }
];
