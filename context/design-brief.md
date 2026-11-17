# Design brief

Handoff for the design phase. It covers only what design needs; the rest of the project is in the
other `context/` files.

## The organization

DFW Lao Heritage is a volunteer-run 501(c)(3) in Dallas–Fort Worth, founded in 2018. It does two things:

1. **Preserves Lao arts and culture**: mainly a week-long summer camp for ages 6–18, with Lao music and
   dance taught by masters from Laos, the Lao alphabet, history, cooking, and a public showcase at the end.
2. **Helps the community**: refugees, immigrants, elders and low-income families get help with
   benefits, immigration paperwork and food resources.

Camp is held at Wat Lao Thepnimith (a Lao Buddhist temple) in Saginaw, Texas. The organization also runs
cultural shows and fundraisers, such as the 2019 Cultural Show and the 2019 Laos Flood Relief Concert.

## Goal

A complete rebrand and redesign. **Nothing visual carries over from the old site**: no colors, fonts
or layouts. The bar is an Awwwards-level site with real interaction craft. It still has to work for
grandparents filling in a help form on an old phone, in Lao.

## Audiences

| Audience                                         | Comes to                           | Design implication                                                 |
| ------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| Parents (often second-generation Lao Americans)  | Learn about camp, register kids    | Clear dates, price, location and register button; trust and warmth |
| Community members, often elders, often Lao-first | Ask for help                       | Calm, plain, large type, high contrast, nothing flashy on `/help`  |
| Donors, sponsors, volunteers                     | Support the work                   | Show impact; low-friction paths                                    |
| Public, press, partners                          | Understand the org and Lao culture | Storytelling, imagery, credibility                                 |

## Brand direction (to be defined)

- **Open:** palette, typography, motion language, art direction, graphic motifs.
- **Logo:** final logo and brand assets are scheduled **last** in the project. Use a typographic
  wordmark placeholder ("DFW Lao Heritage") and design the system so a mark can slot in later.
- **Possible sources from the subject itself** (use with care, see Cultural care):
  - Sinh textiles: woven borders and pattern repeats, and their rhythm.
  - Instruments: the khaen (bamboo mouth organ), khong vong, ranat.
  - Lao dance: hand positions and their slow, deliberate movement.
  - Baci ceremony: white strings tied around the wrist.
  - Temple architecture: layered roofs, naga balustrades.
  - The Lao script itself, which is visually distinctive.
  - The two-cultures identity: Lao heritage lived in Texas.
- **Avoid:**
  - Generic "Southeast Asia" or tourism clichés.
  - Gold-on-red temple kitsch.
  - Using religious imagery decoratively.
  - Flag-heavy nationalism.

### Cultural care

- Treat Buddhist imagery (Buddha figures, monks, temple interiors) respectfully. Never crop it
  playfully, distort it, or use it as texture.
- Patterns and motifs should be inspired, not lifted. Validate the direction with the organization
  before final design.
- Photos of children require a photo release, which the registration form collects. Design for a
  gallery that can be sparse at first.

## Bilingual: English + Lao (ພາສາລາວ)

Every page exists in both languages; Lao lives under `/lo/`. Lao text is machine-translated from
English, so lengths vary and can't be hand-tuned.

- **Typeface pairing:** pick a Latin pairing plus a Lao face that harmonizes in weight and x-height.
  Google Fonts options with Lao coverage include Noto Sans Lao, Noto Serif Lao and Noto Sans Lao
  Looped. A custom or variable display face is fine for Latin headlines if Lao headlines still look
  intentional.
- **Lao script:** vowels and tone marks stack above and below, so it needs roughly 1.6–1.8 line
  height for body text and room for marks in tight display settings. It has no uppercase, so
  all-caps styles must have a Lao alternative, and letter-spacing must not be applied to Lao. Lao
  doesn't separate words with spaces, so test line breaks with real Lao text.
- **Layout:** every template has to hold both languages without changes. Test buttons, nav, cards and
  headlines with Lao strings, which are often wider.
- **Language toggle:** EN ↔ ລາວ, always visible in the header.
- **Machine-translation note:** Lao pages show a small notice that the page was translated
  automatically. It needs a quiet, non-alarming design.

## Constraints

- **Accessibility:** WCAG 2.2 AA in both scripts. Visible focus, real labels on forms, contrast that
  holds on photography, and nothing essential locked inside images.
- **Motion:** every animation needs a `prefers-reduced-motion` fallback that still looks finished.
  Content is readable with JavaScript off; motion is enhancement.
- **Performance:** Lighthouse ≥ 95 and good Core Web Vitals on mid-range phones. WebGL is allowed
  for one or two signature moments if it earns its weight, lazy-loaded and with a static fallback.
- **Mobile-first:** many visitors and all digital-card use are on phones; layouts work from 320px up.
- **Dark mode:** decide whether the brand has one. Not required.
- **Content-driven:** pages are built from CMS content of unknown length (see Content model). Design
  for short and long titles, missing images, one item or twelve.

## What to design

### Main site: `www.dallasfwlaoheritage.com`

| Route                | Template | Notes                                                                                                                                            |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                  | Home     | Story-led. **Four states** driven by the camp calendar: registration open · camp week · showcase coming · off-season                             |
| `/camp`              | Camp     | Program, curriculum, instruments, teachers, FAQ, past showcases, register call to action                                                         |
| `/camp/register`     | Form     | Several campers per submission (add/remove camper), parent and emergency contacts, consents. States: open, closed, validation error, success     |
| `/help`              | Help     | What we help with, how it works, food resources. Calmest page on the site                                                                        |
| `/help/request`      | Form     | Program checklist, preferred language, privacy reassurance. States: form, error, success                                                         |
| `/events`            | List     | Upcoming plus past archive; may be empty                                                                                                         |
| `/events/[slug]`     | Event    | Hero, date/venue, body, gallery, YouTube video, links                                                                                            |
| `/about`             | About    | Mission, story since 2018, board grid, partners                                                                                                  |
| `/about/[person]`    | Bio      | Photo, role, bio, social links (no personal contact info)                                                                                        |
| `/support`           | Support  | Donate (links to Donorbox, PayPal, Zelle, Venmo), sponsor a student, volunteer form                                                              |
| `/contact`           | Contact  | Phone, email, camp location, contact form                                                                                                        |
| `/agent`             | Agent    | Explains how AI assistants can use the site, a chat interface, and a list of machine endpoints. Can feel more "technical" while staying on-brand |
| `/privacy`, `/terms` | Legal    | Long-form reading template                                                                                                                       |
| 404 / error          | Error    | Not found, way back home                                                                                                                         |

**Global:**

- Header: wordmark; nav Camp · Help · Events · About; a Support button; language toggle.
- Mobile menu.
- Footer: phone, email, socials, 501(c)(3)/EIN line, newsletter signup, Contact, Agent, Privacy, Terms.
- Skip link and the machine-translation notice.

### Digital cards: `links.dallasfwlaoheritage.com`

A link-in-bio style card that board members share in person by QR, NFC tap or wallet pass. It has
its own minimal, app-like look with no site nav, and must feel like the same brand.

| Route             | Notes                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`               | Organization card: wordmark, tagline, 2–4 featured links, socials, actions: Save contact · Share · Show QR · Add to Wallet           |
| `/[person]`       | Personal card: photo, name, role, organization; same actions                                                                         |
| `/share/[person]` | Full-screen QR for someone to scan; the screen stays on. Needs to scan well (contrast, quiet zone) and look good held up at an event |

**Also design:**

- Google Wallet and Apple Wallet pass styling: background color, logo, text color, strip/thumbnail image.
- A home-screen app icon and splash.

### Out of scope

The admin submissions table (functional only) and the CMS dashboard (Sanity's own UI).

## Components to define

Header and nav, mobile menu, language toggle, buttons (primary, secondary, link), form controls
(text, textarea, select, checkbox group, consent checkbox, inline errors), repeatable fieldset
(add camper), status messages (success, error, closed), FAQ accordion, image gallery and lightbox,
video embed, event card, person card, CTA band, stat or impact block, notice banner, chat transcript
and input, footer, card-host link button, QR frame.

## Content model the design must fit

Pages are assembled from CMS sections. The current section types are:

- `textSection`: heading, rich text, optional image
- `ctaSection`: heading, text, list of links
- `gallerySection`: heading, images
- `faqSection`: heading, FAQ items

New section types (timeline, quote, stats, instrument showcase, and so on) can be proposed; list
their fields so they can be added to the schema.

Structured content that drives specific UI:

- **Camp season:**
  - Year, dates and hours.
  - Venue and address, ages, tuition, sponsor amount.
  - Payment note and registration open/closed flag.
  - Curriculum list and instruments (name, description, image).
- **Event:** title, start/end, venue, summary, body, hero image, gallery, YouTube URLs, links.
- **Team member:** name, role, photo, short bio, long bio, socials.
- **Site settings:** phone, email, socials, giving links.

Content today is thin: most photography and copy still has to come from the organization. Design
with realistic placeholder content (real camp facts: ages 6–18, about a week in July, at Wat Lao
Thepnimith in Saginaw) and plan for imagery that may be phone-shot.

## Implementation context

The site is already built as an unstyled skeleton. The design should map onto it:

- **Stack:** SvelteKit 3 + Svelte 5, Tailwind CSS 4 (CSS-first tokens via `@theme` in
  `apps/web/src/routes/layout.css`), GSAP + ScrollTrigger and Lenis, wired as Svelte actions in
  `apps/web/src/lib/motion/actions.ts` and already reduced-motion aware.
- **Where pages render:** `apps/web/src/routes/(site)`; the shared page shell is
  `src/lib/components/RoutePage.svelte`; cards are in `src/routes/links` and
  `src/lib/components/Card.svelte`.
- **Live preview:** a Vercel preview of the skeleton is available from the
  `claude/dfw-laos-heritage-replatform-voxipr` branch. Cards are under `/links` there.

## Deliverables from the design phase

1. **Creative direction:** 2–3 distinct directions (moodboard, type pairing including Lao, palette,
   motion idea, one hero sketch each), then one chosen and refined.
2. **Motion principles:** the signature moments (for example, the home hero and a camp storytelling
   sequence), easing and timing, scroll behavior, and reduced-motion equivalents.
3. **Design tokens**, ready for Tailwind 4 `@theme`:
   - color (with semantic roles and contrast notes)
   - type scale for Latin and Lao (families, sizes, line heights, weights)
   - spacing, radius, shadows, breakpoints, motion durations and easings
4. **Component specs:** the components above with states (hover, focus, active, disabled, error).
5. **High-fidelity templates:** every template above at mobile and desktop, at least Home (all four
   states), Camp, Register, Help and Help request, plus the card and share mode, each shown in both
   English and Lao.
6. **Wallet pass and app icon specs.**

Figma is preferred (a Figma connection is available in Claude sessions). Hand back tokens as CSS
custom properties and a short written rationale.

## Questions to settle with the organization

- Any existing logo files or brand elements they want kept, or a fully fresh start?
- Photography: what exists (camp, showcases, community), who owns it, and which images have photo releases?
- Motifs: comfort level with temple, textile and ceremonial references; who in the community can review?
- Tone of voice: warm and familial, or more institutional for funders?
