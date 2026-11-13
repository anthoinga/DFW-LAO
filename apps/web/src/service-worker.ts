/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

/**
 * Offline support for the digital cards only (links.* host), so a card and its QR
 * still open at events with poor signal. The main site is not cached.
 */
const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cards-${version}`;
const isCardHost = sw.location.hostname.startsWith('links.');

sw.addEventListener('install', (event) => {
	if (!isCardHost) return;
	event.waitUntil(
		caches.open(CACHE).then((cache) => cache.addAll([...immutable, ...assets].map((a) => a.path)))
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
	);
});

sw.addEventListener('fetch', (event) => {
	if (!isCardHost || event.request.method !== 'GET') return;
	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			try {
				const response = await fetch(event.request);
				if (response.ok && new URL(event.request.url).origin === sw.location.origin) {
					cache.put(event.request, response.clone());
				}
				return response;
			} catch {
				const cached = await cache.match(event.request);
				if (cached) return cached;
				throw new Error('offline');
			}
		})()
	);
});
