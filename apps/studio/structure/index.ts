import type { StructureResolver } from 'sanity/structure';

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
	S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type));

export const structure: StructureResolver = (S) =>
	S.list()
		.title('Content')
		.items([
			S.documentTypeListItem('page').title('Pages'),
			S.documentTypeListItem('campSeason').title('Camp seasons'),
			S.documentTypeListItem('event').title('Events'),
			S.documentTypeListItem('teamMember').title('Team'),
			S.documentTypeListItem('faq').title('FAQ'),
			S.documentTypeListItem('linkCard').title('Digital cards'),
			S.divider(),
			S.documentTypeListItem('redirect').title('Redirects'),
			singleton(S, 'siteSettings', 'Site settings'),
			singleton(S, 'orgFacts', 'Organization facts'),
			singleton(S, 'i18nGlossary', 'Translation glossary')
		]);

export const inboxStructure: StructureResolver = (S) =>
	S.list()
		.title('Inbox')
		.items([
			S.documentTypeListItem('contactMessage').title('Contact messages'),
			S.documentTypeListItem('volunteerInterest').title('Volunteers'),
			S.documentTypeListItem('newsletterSubscriber').title('Newsletter')
		]);
