# Legacy site

The previous site (Wix, 19 public pages plus system pages) is a reference only: it tells us which
capabilities must still exist and which URLs need redirects. Nothing is migrated from it; content is
rewritten in the Studio.

## Capability coverage

| Old capability                         | Now                                                          |
| -------------------------------------- | ------------------------------------------------------------ |
| Page editing                           | Sanity Studio with visual editing                            |
| Newsletter signup                      | Own form → Studio inbox                                      |
| Contact form                           | Own form → Studio inbox + email                              |
| Social services intake                 | Secure form → D1, multi-select programs, consent             |
| Camp registration (one child per form) | Multi-child form → D1, consents, confirmation email          |
| "Buy Now" tuition payment              | Payment at camp (stated on the camp season)                  |
| Donorbox, PayPal, Zelle, Venmo         | Links on `/support`                                          |
| Photo galleries                        | Native gallery with Sanity image CDN                         |
| Hosted videos                          | YouTube embeds                                               |
| Hand-built event pages                 | `event` documents with Event structured data                 |
| Board bios                             | `teamMember` documents at `/about/[person]`                  |
| SEO settings, sitemap, robots          | Per-document SEO, generated sitemap/robots, redirect manager |
| Analytics                              | GA4, Search Console, Cloudflare Web Analytics                |
| Member accounts                        | Dropped                                                      |
| Fixed-width mobile layout              | Responsive from 320px                                        |

## Known problems we are fixing

- Conflicting facts (camp year, price, length; two phone numbers) → one `campSeason` and one `siteSettings`.
- Placeholder privacy policy and terms while collecting sensitive data → real policies and consent text.
- Event details only inside images → text content with alt text.
- Missing meta descriptions, headings and structured data → enforced by the content model.
- Orphaned and empty pages → removed or redirected.

## Form fields carried forward

- **Camp registration:** child first/last name, age (6–18), T-shirt size, allergies/medical notes;
  parent name, email, phone; emergency contact; volunteer interest; photo release; liability consent; comments.
- **Community help:** first/last name, email or phone, programs (unemployment, Medicaid/Medicare,
  SNAP/TANF, SSI/SSA, phone service, utility bills, immigration, food, other), details, preferred language, consent.
- **Contact:** name, email, subject, message.
- **Newsletter:** name (optional), email.

The URL-by-URL redirect map is in `apps/web/src/lib/server/redirects.ts` and is covered by tests.
