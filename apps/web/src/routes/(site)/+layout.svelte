<script lang="ts">
	import { page } from '$app/state';
	import { NAV } from '#lib/config.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { smoothScroll } from '#lib/motion/actions.ts';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const locale = $derived(getLocale());
	const otherLocale = $derived(locale === 'en' ? 'lo' : 'en');
	const settings = $derived(data.site.settings);
</script>

<div use:smoothScroll>
	<a class="sr-only focus:not-sr-only" href="#main">{m.skip_to_content()}</a>

	<header>
		<a href={localizeHref('/')}>{m.site_name()}</a>
		<nav aria-label="Main">
			<ul>
				{#each NAV as item (item.href)}
					<li>
						<a
							href={localizeHref(item.href)}
							aria-current={page.url.pathname.endsWith(item.href) ? 'page' : undefined}
						>
							{m[item.key]()}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<a href={localizeHref('/support')}>{m.nav_support()}</a>
		<a
			href={localizeHref(page.url.pathname, { locale: otherLocale })}
			hreflang={otherLocale}
			lang={otherLocale}
			data-sveltekit-reload>{m.language_switch()}</a
		>
	</header>

	{#if locale === 'lo'}
		<p role="note">{m.machine_translated()}</p>
	{/if}

	<main id="main">
		{@render children()}
	</main>

	<footer>
		<p>{m.footer_nonprofit()}{settings.ein ? ` EIN ${settings.ein}.` : ''}</p>
		<p>
			<a href="tel:{settings.phone}">{settings.phone}</a> ·
			<a href="mailto:{settings.email}">{settings.email}</a>
		</p>
		<ul>
			{#each settings.socials ?? [] as social (social.href)}
				<li><a href={social.href} rel="me noopener">{social.icon}</a></li>
			{/each}
		</ul>
		<nav aria-label="Footer">
			<a href={localizeHref('/contact')}>{m.nav_contact()}</a>
			<a href={localizeHref('/agent')}>{m.nav_agent()}</a>
			<a href={localizeHref('/privacy')}>{m.footer_privacy()}</a>
			<a href={localizeHref('/terms')}>{m.footer_terms()}</a>
		</nav>
		<p>© {new Date().getFullYear()} {settings.name}</p>
	</footer>
</div>
