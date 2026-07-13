const reduceMotion = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el: HTMLElement, raw: string) {
	const m = raw.match(/^([\d.]+)\s*(.*)$/);
	if (!m) {
		el.textContent = raw;
		return;
	}
	const target = parseFloat(m[1]);
	const suffix = m[2];
	const dur = 1100;
	const start = performance.now();
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / dur);
		const eased = 1 - Math.pow(1 - t, 3);
		const val = target * eased;
		el.textContent =
			(target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
		if (t < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}

export function animateCountsAndBars(root: HTMLElement) {
	const io = new IntersectionObserver(
		(entries, obs) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				const el = e.target as HTMLElement;
				if (el.dataset.pct) {
					el.style.width = el.dataset.pct + '%';
					if (el.classList.contains('bar-toon')) {
						el.classList.add('is-animated');
					}
				}
				if (el.dataset.count) {
					if (reduceMotion()) el.textContent = el.dataset.count;
					else countUp(el, el.dataset.count);
				}
				obs.unobserve(el);
			}
		},
		{ threshold: 0.35 }
	);
	root
		.querySelectorAll<HTMLElement>('.bar[data-pct], [data-count]')
		.forEach((el) => io.observe(el));
}

export function revealCards(root: HTMLElement, selector: string) {
	if (reduceMotion()) return;
	const cards = Array.from(root.querySelectorAll<HTMLElement>(selector));
	if (!cards.length) return;
	cards.forEach((c) => c.classList.add('pre-reveal'));
	const io = new IntersectionObserver(
		(entries, obs) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				const i = cards.indexOf(e.target as HTMLElement);
				e.target.style.transitionDelay = Math.min(i, 8) * 70 + 'ms';
				e.target.classList.add('revealed');
				obs.unobserve(e.target);
			}
		},
		{ threshold: 0.15 }
	);
	cards.forEach((c) => io.observe(c));
}

/**
 * Add `cls` to `root` the first time it scrolls into view. Used to trigger
 * CSS transitions (graph draw-in, etc.) without animating above the fold.
 */
export function revealOnView(root: HTMLElement, cls: string) {
	if (reduceMotion()) {
		root.classList.add(cls);
		return;
	}
	const io = new IntersectionObserver(
		(entries, obs) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				e.target.classList.add(cls);
				obs.unobserve(e.target);
			}
		},
		{ threshold: 0.35 }
	);
	io.observe(root);
}
