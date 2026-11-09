import { clamp01 } from '../core/ease';

interface Options {
  /** 'pin': progress across a tall sticky section. 'pass': progress as the element travels through the viewport. */
  mode: 'pin' | 'pass';
  /** 0..1 easing factor toward the target each frame; omit for no smoothing. */
  smooth?: number;
}

/**
 * Scroll progress binding. One passive scroll listener and one read
 * (getBoundingClientRect) per event; the optional rAF integrator eases the
 * reported value toward the target so scrubbing feels weighted, not snapped.
 */
export function bindProgress(el: HTMLElement, cb: (p: number) => void, opts: Options) {
  let target = 0;
  let current = 0;
  let raf = 0;

  const read = () => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (opts.mode === 'pin') {
      const range = r.height - vh;
      return range <= 0 ? 0 : clamp01(-r.top / range);
    }
    return clamp01((vh * 0.75 - r.top) / Math.max(1, r.height));
  };

  const tick = () => {
    const k = opts.smooth ?? 1;
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.0004) current = target;
    cb(current);
    raf = current === target ? 0 : requestAnimationFrame(tick);
  };

  const onScroll = () => {
    target = read();
    if (!raf) raf = requestAnimationFrame(tick);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  target = read();
  current = target;
  cb(current);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    cancelAnimationFrame(raf);
  };
}
