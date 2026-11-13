# Stack

Constraints: two developers maintain everything; the content editor is an SEO specialist; recurring
costs stay close to zero.

| Concern           | Choice                                                                | Cost                       | Why                                                                                               |
| ----------------- | --------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| Framework         | SvelteKit 3, Svelte 5, TypeScript                                     | $0                         | Small bundles for Core Web Vitals; form actions work without JavaScript                           |
| Styling           | Tailwind CSS 4                                                        | $0                         | Design tokens arrive with the visual direction                                                    |
| Motion            | GSAP + ScrollTrigger, Lenis (as Svelte actions, reduced-motion aware) | $0                         | Scroll-driven interaction; WebGL deferred until the design calls for it                           |
| CMS               | Sanity (free plan), Studio deployed to `*.sanity.studio`              | $0                         | Hosted content store, structured SEO fields, visual editing, typed queries                        |
| Hosting           | Cloudflare Workers (`@sveltejs/adapter-cloudflare`)                   | $0                         | Free tier allows nonprofit use; edge caching                                                      |
| Domain / DNS      | Cloudflare Registrar                                                  | ~$10/yr                    | One vendor for DNS, hosting, spam protection, analytics                                           |
| Spam protection   | Cloudflare Turnstile                                                  | $0                         | Invisible challenge, privacy-friendly                                                             |
| Email             | Resend (free tier)                                                    | $0                         | Notifications and confirmations                                                                   |
| Sensitive data    | Cloudflare D1 + Cloudflare Access                                     | $0                         | Keeps medical, benefits and immigration details out of the CMS, where board members have accounts |
| Other submissions | Sanity private `submissions` dataset                                  | $0                         | Contact, volunteer and newsletter entries in a read-only Studio inbox                             |
| i18n              | Paraglide (interface strings), internationalized arrays (content)     | $0                         | One document and one slug per page in both languages                                              |
| Translation       | Claude Opus 5.5 via the Claude API, on publish                        | ~$1–2 initial, cents/month | Lao is generated from English; no one writes Lao by hand                                          |
| AI chat           | Claude Haiku 5.5, prompt-cached site content                          | a few $/month, capped      | No vector database needed for a small site                                                        |
| Analytics         | GA4, Search Console, Cloudflare Web Analytics                         | $0                         | Tools the SEO lead already uses                                                                   |
| Wallet passes     | Google Wallet (free), Apple Wallet ($99/yr developer account, later)  | $0 → $99/yr                | Digital cards in the phone's wallet                                                               |
| CI                | GitHub Actions, Dependabot                                            | $0                         |                                                                                                   |

## Rejected

- **Next.js / Vercel:** the team prefers Svelte; Vercel's free tier is for non-commercial use only.
- **Payload CMS:** we would have to run and back up a database.
- **Stripe:** no online tuition payments.
- **Embedded donation widgets, third-party form builders:** extra scripts and vendors for little gain.
- **@sanity/svelte-loader:** does not support SvelteKit 3 yet; we use `@sanity/client` directly.
