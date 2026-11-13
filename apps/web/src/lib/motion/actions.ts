import type { Action } from 'svelte/action';

export const prefersReducedMotion = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smooth scrolling for the whole document. Skipped when the user prefers reduced motion. */
export const smoothScroll: Action = () => {
	if (prefersReducedMotion()) return;
	let destroy = () => {};
	(async () => {
		const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
			import('lenis'),
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);
		gsap.registerPlugin(ScrollTrigger);
		const lenis = new Lenis({ autoRaf: false });
		lenis.on('scroll', ScrollTrigger.update);
		const tick = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
		destroy = () => {
			gsap.ticker.remove(tick);
			lenis.destroy();
		};
	})();
	return { destroy: () => destroy() };
};

/** Fade/slide an element in when it scrolls into view. */
export const reveal: Action<HTMLElement, { y?: number; delay?: number } | undefined> = (
	node,
	options = {}
) => {
	if (prefersReducedMotion()) return;
	let destroy = () => {};
	(async () => {
		const [{ gsap }, { ScrollTrigger }] = await Promise.all([
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);
		gsap.registerPlugin(ScrollTrigger);
		const tween = gsap.from(node, {
			autoAlpha: 0,
			y: options.y ?? 24,
			duration: 0.8,
			delay: options.delay ?? 0,
			ease: 'power3.out',
			scrollTrigger: { trigger: node, start: 'top 85%', once: true }
		});
		destroy = () => tween.scrollTrigger?.kill() ?? tween.kill();
	})();
	return { destroy: () => destroy() };
};
