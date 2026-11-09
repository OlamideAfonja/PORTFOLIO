import { animate } from 'animejs';

export interface Inset {
  t: number;
  r: number;
  b: number;
  l: number;
  radius: number;
}

export const insetCss = (i: Inset) => `inset(${i.t}px ${i.r}px ${i.b}px ${i.l}px round ${i.radius}px)`;

const mix = (a: Inset, b: Inset, k: number): Inset => ({
  t: a.t + (b.t - a.t) * k,
  r: a.r + (b.r - a.r) * k,
  b: a.b + (b.b - a.b) * k,
  l: a.l + (b.l - a.l) * k,
  radius: a.radius + (b.radius - a.radius) * k,
});

export const FULL: Inset = { t: 0, r: 0, b: 0, l: 0, radius: 0 };

export const rectInset = (rect: DOMRect): Inset => ({
  t: rect.top,
  l: rect.left,
  r: window.innerWidth - rect.right,
  b: window.innerHeight - rect.bottom,
  radius: 22,
});
/** A zero-height strip pinned to the bottom edge: the curtain rises from here. */
export const bottomEdge = (): Inset => ({ t: window.innerHeight, r: 0, b: 0, l: 0, radius: 0 });
/** A zero-height strip pinned to the top edge: the curtain collapses up into here. */
export const topEdge = (): Inset => ({ t: 0, r: 0, b: window.innerHeight, l: 0, radius: 0 });

/**
 * Tweens a plain { p } object and writes the clip-path string ourselves each
 * frame. That avoids depending on how a library interpolates numbers inside
 * an inset(...) string, and keeps the effect identical across browsers.
 */
export function tweenInset(
  el: HTMLElement,
  from: Inset,
  to: Inset,
  duration: number,
  ease: string,
): Promise<void> {
  return new Promise((resolve) => {
    const k = { p: 0 };
    el.style.clipPath = insetCss(from);
    animate(k, {
      p: [0, 1],
      duration,
      ease,
      onUpdate: () => {
        el.style.clipPath = insetCss(mix(from, to, k.p));
      },
      onComplete: () => resolve(),
    });
  });
}
