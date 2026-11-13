# Decisions

Agreed with the organization on 2026-11-13.

| #   | Topic                    | Decision                                                                                                               |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Phone                    | 682-331-7779 is the single published number                                                                            |
| 2   | Community help           | Program is active; the intake form is rebuilt securely                                                                 |
| 3   | Intake notifications     | Sent to the organization Gmail                                                                                         |
| 4   | Camp tuition             | Registration only; payment by check or cash at camp (no online payment)                                                |
| 5   | Donations / sponsorship  | Links only (Donorbox, PayPal, Zelle, Venmo); no embedded widgets                                                       |
| 6   | Newsletter               | Our own signup form; subscribers stored in the CMS inbox, mailing tool later                                           |
| 7   | Language                 | Fully bilingual English + Lao. Content is written in English and translated to Lao automatically                       |
| 8   | Lao URLs                 | English at the root, Lao under `/lo/`, with hreflang pairs                                                             |
| 9   | Old `.org` domain        | Not re-registered; one domain                                                                                          |
| 10  | Team contact details     | No personal contact info on the main site (opt-in exception on digital cards, #20)                                     |
| 11  | Instruments page         | Folded into the Camp page                                                                                              |
| 12  | 2019 events              | Recreated as past events                                                                                               |
| 13  | Hosting                  | Cloudflare (Workers, DNS, Turnstile, Registrar)                                                                        |
| 14  | CMS users                | Developers (admin), SEO lead, board members                                                                            |
| 15  | Camp registration        | Several children per submission; allergy/medical notes, emergency contact, photo release and liability consent         |
| 16  | Agent experience         | An "Agent" page plus machine-readable access for AI assistants: llms.txt, Markdown pages, JSON API, MCP server, chat   |
| 17  | AI chat                  | Claude Haiku 5.5, answers only from site content, English and Lao, hard spending cap                                   |
| 18  | Information architecture | Flat, task-based structure (see architecture.md)                                                                       |
| 19  | Digital cards            | Served at `links.dallasfwlaoheritage.com`                                                                              |
| 20  | Card scope               | One organization card plus a card per person; personal email/phone is opt-in per person and appears only on their card |
| 21  | Sharing                  | Full-screen QR share mode, native share sheet, Google Wallet now and Apple Wallet once the developer account exists    |

## Defaults we chose

- Old member-account pages are dropped and redirect to the home page.
- Video is hosted on the organization's YouTube channel.
- The old `/about` URL (formerly the camp page) now serves the About page, which links prominently to Camp.
- Sensitive submissions are kept for one year, then deleted automatically.
- The design and brand are new; nothing visual carries over from the old site.
