import { defineQuery } from 'groq';

export const SITE_QUERY = defineQuery(`{
	"settings": *[_id == "siteSettings"][0],
	"facts": *[_id == "orgFacts"][0]
}`);

export const PAGE_QUERY = defineQuery(`*[_type == "page" && route == $route][0]{
	..., sections[]{ ..., _type == "faqSection" => { ..., items[]-> } }
}`);

export const CAMP_QUERY = defineQuery(`*[_type == "campSeason"] | order(year desc)[0]`);

export const EVENTS_QUERY = defineQuery(
	`*[_type == "event" && defined(slug.current)] | order(startsAt desc){ _id, title, slug, startsAt, endsAt, venueName, summary, heroImage }`
);

export const EVENT_QUERY = defineQuery(`*[_type == "event" && slug.current == $slug][0]`);

export const TEAM_QUERY = defineQuery(
	`*[_type == "teamMember" && defined(slug.current)] | order(order asc){ _id, name, slug, role, photo, shortBio }`
);

export const PERSON_QUERY = defineQuery(`*[_type == "teamMember" && slug.current == $slug][0]`);

export const FAQ_QUERY = defineQuery(
	`*[_type == "faq"] | order(topic asc){ _id, question, answer, topic }`
);

export const CARD_QUERY = defineQuery(
	`*[_type == "linkCard" && (($slug == "" && kind == "org") || slug.current == $slug)][0]`
);

export const REDIRECTS_QUERY = defineQuery(`*[_type == "redirect"]{ from, to, permanent }`);

export const SITEMAP_QUERY = defineQuery(`{
	"pages": *[_type == "page" && seo.noindex != true]{ route, _updatedAt },
	"events": *[_type == "event" && seo.noindex != true]{ "slug": slug.current, _updatedAt },
	"team": *[_type == "teamMember" && seo.noindex != true]{ "slug": slug.current, _updatedAt }
}`);
