'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger, splitText, utils, type JSAnimation } from 'animejs';
import { site } from '@/content/site';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { useCurtainRelease } from '@/ui/providers/TransitionProvider';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';
import { DUR, EASE } from '@/engine/motion/tokens';
import { AmbientField } from './AmbientField';

function RotatingWord({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReducedMotion()) return;
    let i = 0;
    let timer = 0;
    let anim: JSAnimation | undefined;
    let dead = false;
    const swap = () => {
      anim = animate(el, {
        translateY: ['0%', '-115%'],
        opacity: [1, 0],
        duration: 320,
        ease: 'inQuad',
        onComplete: () => {
          if (dead) return;
          i = (i + 1) % words.length;
          el.textContent = words[i];
          anim = animate(el, {
            translateY: ['115%', '0%'],
            opacity: [0, 1],
            duration: 560,
            ease: EASE.out,
            onComplete: () => {
              timer = window.setTimeout(swap, 1700);
            },
          });
        },
      });
    };
    timer = window.setTimeout(swap, 2400);
    return () => {
      dead = true;
      window.clearTimeout(timer);
      anim?.cancel();
      el.style.transform = '';
      el.style.opacity = '';
      el.textContent = words[0];
    };
  }, [words]);
  return (
    <span className="rotator">
      <span ref={ref}>{words[0]}</span>
    </span>
  );
}

export function Hero() {
  useCurtainRelease();
  const ref = useMotionScope<HTMLElement>((root) => {
    if (prefersReducedMotion()) return;
    const h1 = root.querySelector<HTMLElement>('[data-split]')!;
    const split = splitText(h1, { chars: true });
    split.addEffect(() => {
      utils.set(split.chars, { opacity: 0 });
      h1.style.opacity = '1';
      return animate(split.chars, {
        opacity: [0, 1],
        translateY: ['0.6em', '0em'],
        rotate: [6, 0],
        delay: stagger(26, { start: 250 }),
        duration: DUR.slow,
        ease: EASE.out,
      });
    });
    animate(root.querySelectorAll('[data-hero-in]'), {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(130, { start: 900 }),
      duration: DUR.base,
      ease: EASE.out,
    });
    return () => split.revert();
  }, []);

  return (
    <section ref={ref} className="hero">
      <AmbientField />
      <div className="wrap hero-inner">
        <p className="eyebrow" data-hero-in>
          {site.role} · {site.place}
        </p>
        <h1 data-split>{site.name}</h1>
        <p className="hero-sub" data-hero-in>
          I build <RotatingWord words={site.rotating} />.
        </p>
        <p className="lede" data-hero-in>
          {site.lede}
        </p>
        <p className="hint" data-hero-in>
          Scroll <span className="hint-line" />
        </p>
      </div>
    </section>
  );
}
