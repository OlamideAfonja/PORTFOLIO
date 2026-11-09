'use client';
import { useEffect, useMemo, useRef } from 'react';
import { buildAmbient } from '@/engine/illustration/ambient';
import { mountLoop } from '@/engine/illustration/player';
import { observeVisible } from '@/engine/core/visibility';
import { subscribePointer } from '@/engine/core/pointer';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';

/** Hero background: the real diagram engine running a generated graph, with pointer parallax. */
export function AmbientField() {
  const host = useRef<HTMLDivElement>(null);
  const spec = useMemo(() => buildAmbient(), []);
  useEffect(() => {
    const el = host.current!;
    const h = mountLoop(el, spec, { compact: true, trail: 3, className: 'ambient' });
    if (prefersReducedMotion()) {
      h.scene.paint(h.scene.schedule.total * 0.6);
      return () => h.destroy();
    }
    const stop = observeVisible(el, (v) => (v ? h.anim.play() : h.anim.pause()));
    const off = subscribePointer((s) => {
      el.style.transform = `translate3d(${s.nx * -18}px, ${s.ny * -12}px, 0)`;
    });
    return () => {
      stop();
      off();
      h.destroy();
    };
  }, [spec]);
  return <div ref={host} className="ambient-field" aria-hidden="true" />;
}
