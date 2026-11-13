# Roadmap

Branding and social content come last.

## 0 · Discovery — done

- [x] Decisions closed (see decisions.md)
- [ ] Domain transfer authorization from the organization
- [ ] Content checklist from the organization: English copy, EIN and mailing address, next camp
      season details, bios and photos for all board members

## 1 · Foundation — done

- [x] Monorepo, tooling, CI
- [x] Content model with SEO and bilingual fields; Studio with inbox workspace
- [x] Route skeleton in English and Lao; legacy redirects; sitemap and robots
- [x] Agent layer: llms.txt, Markdown pages, JSON API, MCP server, chat endpoint
- [x] Translation pipeline (webhook, field hashing, glossary, scripts)
- [x] Forms with validation and storage; admin view for sensitive submissions
- [x] Digital card host: cards, vCard, share mode, Google Wallet

## 2 · Platform setup

- [ ] Create the Sanity project and datasets (`production`, private `submissions`); deploy the Studio;
      invite developers, the SEO lead and board members
- [ ] Cloudflare: Worker, D1 database, KV namespace, Turnstile site, Access policy for `/admin`,
      `links.` and `www.` custom domains, preview deployments
- [ ] Secrets: Sanity tokens and webhook secret, Resend, Anthropic (prepaid credits, auto-reload off), Google Wallet
- [ ] Sanity webhooks: translation (`/api/i18n/translate`) and cache purge on publish
- [ ] Enable visual editing (Presentation) against preview deployments

## 3 · Design

- [ ] Creative direction, moodboard and motion principles
- [ ] Design system and tokens, including Lao typography
- [ ] High-fidelity designs and motion prototypes (desktop and mobile)

## 4 · Build

- [ ] Components and section renderer from the design system
- [ ] Pages, home page camp-season states, gallery and video
- [ ] Form styling, error states and confirmation pages
- [ ] Motion layer (and WebGL if the design calls for it) with reduced-motion fallbacks
- [ ] Accessibility (WCAG 2.2 AA in both scripts) and performance (Lighthouse ≥ 95)
- [ ] Privacy policy, terms and consent copy reviewed by counsel
- [ ] Card host styling, PWA icons

## 5 · Content and launch

- [ ] Organization enters English content, FAQ and organization facts; run the Lao backfill
- [ ] Optional spot-check of Lao by a community member
- [ ] Recreate the 2019 Cultural Show and Flood Relief Concert as past events
- [ ] SEO lead onboarding: Studio, redirects, Search Console, hreflang
- [ ] QA and acceptance; domain transfer and DNS cutover; retire the old site
- [ ] Check answers about the organization in AI assistants and answer engines; chat question set in English and Lao

## 6 · Last

- [ ] Apple Wallet once the developer account and certificates exist
- [ ] NFC cards or stickers for board members
- [ ] Logo and brand assets, social images, update links on Facebook, Instagram, YouTube and Donorbox
- [ ] Awwwards submission
