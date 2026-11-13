# Architecture

## Site structure

Audiences and what they come to do:

- **Parents:** enroll children in the Lao arts & culture summer camp.
- **Community members:** get help with benefits and immigration paperwork, often in Lao.
- **Supporters:** donate, sponsor a student, volunteer.
- **The public, press and AI assistants:** learn about the organization and Lao culture.

```
/                     Home — changes with the camp season (registration → camp week → showcase → off-season)
/camp                 Program, curriculum, instruments, teachers, FAQ, past showcases
/camp/register        Multi-child registration
/help                 Community help: what we help with, how it works, food resources
/help/request         Secure intake form
/events, /events/[slug]
/about, /about/[person]
/support              Donate · Sponsor a student (#sponsor) · Volunteer (#volunteer)
/contact
/agent                For AI assistants + chat
/privacy, /terms
```

Every page also exists under `/lo/`. Main navigation: Camp · Help · Events · About, a Support
button and a language toggle. A `/stories` section (Lao culture journal) is a candidate for after launch.

Routing lives in `src/hooks.ts` (Lao prefix, card host) and `src/hooks.server.ts` (legacy redirects,
Markdown twins, security headers). Legacy URLs are mapped in `src/lib/server/redirects.ts`; editors
can add more as `redirect` documents in the Studio.

## Content model (Sanity)

- **Singletons:** `siteSettings` (contact, socials, giving links, default SEO), `orgFacts` (canonical
  facts reused by JSON-LD, llms.txt, the API, MCP and chat), `i18nGlossary` (translation terms and style).
- **Documents:** `page` (one per route, built from sections), `campSeason` (single source for dates,
  price, registration status, curriculum, instruments), `event`, `teamMember`, `faq`, `linkCard`, `redirect`.
- **SEO:** every routable document has an `seo` object (title, description, social image, canonical,
  noindex) per language. Images require alt text.
- **Inbox workspace:** `contactMessage`, `volunteerInterest`, `newsletterSubscriber` in the private
  `submissions` dataset, read-only.

## Languages

- Interface strings: `apps/web/messages/{en,lo}.json` (Paraglide). A unit test fails if Lao is missing a key.
- Content: each translatable field stores `en` and `lo` values in one document, so URLs and slugs are shared.
- **Translation pipeline:** publishing a document triggers a signed webhook to `/api/i18n/translate`.
  It finds English fields whose content changed (hash per field), sends only those to Claude with the
  glossary, and writes the Lao values back with a status (`machine`, `reviewed`, `error`). Rich text is
  translated span by span, keeping links and formatting. Reviewed Lao is kept until its English changes.
  "Translate to Lao" in the Studio forces a full re-translation. `pnpm i18n:backfill` does the same in bulk.
- Lao pages show a short "translated automatically" note.

## Agent and search layer

All generated from the CMS, so there is one source of truth:

| Surface                                 | URL                                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| Agent page with chat                    | `/agent`                                                                          |
| llms.txt index / full text              | `/llms.txt`, `/llms-full.txt` (and `/lo/…`)                                       |
| Markdown version of any page            | `<page>.md` or `Accept: text/markdown`                                            |
| JSON API (read-only, open CORS)         | `/api/v1`, `/api/v1/{org,camp-season,events,team,faq,page,search}`                |
| MCP server (stateless, read-only tools) | `/mcp`                                                                            |
| Structured data                         | `NGO`, `Event`, `Person`, `BreadcrumbList` JSON-LD                                |
| Crawlers                                | `robots.txt` welcomes AI search and answer crawlers; private paths are disallowed |

Chat (`/api/chat`): Claude Haiku 5.5 with the full site text as a cached system prompt; answers only
from that text, in the visitor's language. Guarded by Turnstile on the first message, a per-visitor
rate limit, a daily cap (KV) and prepaid API credits. Conversations are not stored.

Never exposed to these surfaces: form submissions, personal card contact details, drafts.

## Forms and data handling

| Form                           | Stored in                                  | Notification                                         |
| ------------------------------ | ------------------------------------------ | ---------------------------------------------------- |
| Camp registration              | D1 (`camp_registrations`, `camp_children`) | Org email (no medical details) + parent confirmation |
| Community help request         | D1 (`assistance_requests`)                 | Org email (no free-text details)                     |
| Contact, volunteer, newsletter | Sanity `submissions` dataset               | Org email for contact and volunteer                  |

All forms: server-side validation (Zod), Turnstile, consent where required. Sensitive records are
deleted after one year and are viewable only at `/admin/submissions`, protected by a Cloudflare Access
policy and re-verified in the app.

## Digital cards

`links.dallasfwlaoheritage.com` is served by the same Worker; the hostname routes requests to
`src/routes/links`. Cards are `linkCard` documents (one organization card, one per person).

- Featured links can be scheduled, so printed QR codes and NFC tags never need updating.
- **Save contact** downloads a vCard. Personal email/phone appears only if that person opted in.
- **Share mode** (`/share`): full-screen QR, screen kept awake, native share sheet, copy link.
- **Wallet:** Google Wallet generic pass via a signed JWT; Apple Wallet is behind `APPLE_WALLET_ENABLED`.
- Every QR, pass and NFC link carries `?src=…&p=…` for analytics.
- Personal cards are `noindex`. The card host works offline once opened (service worker).
