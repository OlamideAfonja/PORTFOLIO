import { animate, type JSAnimation } from 'animejs';
import { DUR, EASE } from './tokens';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Fades and lifts every [data-reveal] inside `root` once it scrolls into view.
 * Optional data-reveal-delay (ms) staggers siblings. The hidden initial state
 * lives in CSS and only applies when scripting is on and motion is allowed.
 */
export function revealAll(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};
  const anims: JSAnimation[] = [];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const el = e.target as HTMLElement;
        anims.push(
          animate(el, {
            opacity: [0, 1],
            translateY: [34, 0],
            duration: DUR.base,
            delay: Number(el.dataset.revealDelay ?? 0),
            ease: EASE.out,
          }),
        );
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    anims.forEach((a) => a.revert());
  };
}
