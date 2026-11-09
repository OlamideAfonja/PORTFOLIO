import { useEffect, useRef } from 'react';
import { subscribePointer } from '@/engine/core/pointer';

/** Pulls the element toward the pointer when it is within `radius` px. */
export function useMagnetic<T extends HTMLElement>(radius = 150, strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let moved = false;
    const off = subscribePointer((s) => {
      const r = el.getBoundingClientRect();
      const dx = s.x - (r.left + r.width / 2);
      const dy = s.y - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < radius) {
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
        moved = true;
      } else if (moved) {
        el.style.transform = '';
        moved = false;
      }
    });
    return () => {
      off();
      el.style.transform = '';
    };
  }, [radius, strength]);
  return ref;
}
