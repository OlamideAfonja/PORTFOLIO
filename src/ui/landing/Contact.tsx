'use client';
import { site } from '@/content/site';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { useMagnetic } from '@/ui/hooks/useMagnetic';
import { revealAll } from '@/engine/motion/reveal';

export function Contact() {
  const ref = useMotionScope<HTMLElement>(revealAll, []);
  const cta = useMagnetic<HTMLAnchorElement>();
  return (
    <section ref={ref} id="contact" className="section contact">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Contact
        </p>
        <h2 className="big" data-reveal>
          Let&apos;s build something.
        </h2>
        <a ref={cta} className="cta" href={`mailto:${site.email}`} data-reveal data-cursor="Email">
          {site.email}
        </a>
        <p className="muted" data-reveal>
          <a href={site.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {' · '}© 2026 {site.name}
        </p>
      </div>
    </section>
  );
}
