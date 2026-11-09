'use client';
import { useEffect, useRef } from 'react';
import type { Illustration } from '@/content/schema';
import { observeVisible } from '@/engine/core/visibility';
import { mountLoop, type LoopHandle } from '@/engine/illustration/player';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';

interface Props {
  illustration: Illustration;
  variant?: 'thumb' | 'hero';
  fast?: boolean;
}

/** A looping miniature of a project's flow. Built lazily, paused off-screen. */
export function SceneThumb({ illustration, variant = 'thumb', fast = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<LoopHandle | null>(null);

  useEffect(() => {
    const el = host.current!;
    const opts = variant === 'thumb' ? { compact: true, trail: 2 } : { className: 'hero-scene', trail: 3 };
    if (prefersReducedMotion()) {
      const h = mountLoop(el, illustration, opts);
      h.scene.paint(h.scene.schedule.total);
      return () => h.destroy();
    }
    const stop = observeVisible(el, (visible) => {
      if (visible) {
        handle.current ??= mountLoop(el, illustration, opts);
        handle.current.anim.play();
      } else {
        handle.current?.anim.pause();
      }
    });
    return () => {
      stop();
      handle.current?.destroy();
      handle.current = null;
    };
  }, [illustration, variant]);

  useEffect(() => {
    if (handle.current) handle.current.anim.speed = fast ? 2.4 : 1;
  }, [fast]);

  return <div ref={host} className={`thumb thumb-${variant}`} />;
}
