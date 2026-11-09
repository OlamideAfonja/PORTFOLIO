'use client';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { observeVisible } from '@/engine/core/visibility';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';

export function Marquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!;
    if (prefersReducedMotion()) return;
    const anim = animate(el, {
      translateX: ['0%', '-50%'],
      duration: items.length * 2600,
      ease: 'linear',
      loop: true,
      autoplay: false,
    });
    const stop = observeVisible(el, (v) => (v ? anim.play() : anim.pause()));
    return () => {
      stop();
      anim.cancel();
    };
  }, [items]);
  return (
    <div className="marquee" aria-hidden="true">
      <div ref={track} className="marquee-track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
