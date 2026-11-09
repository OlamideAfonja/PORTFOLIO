'use client';
import { animate, stagger, splitText, utils } from 'animejs';
import type { Project } from '@/content/schema';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { useTransition } from '@/ui/providers/TransitionProvider';
import { SceneThumb } from '@/ui/SceneThumb';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';
import { DUR, EASE } from '@/engine/motion/tokens';

export function CaseHero({ project }: { project: Project }) {
  const { navigate } = useTransition();
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
        delay: stagger(22, { start: 380 }),
        duration: DUR.slow,
        ease: EASE.out,
      });
    });
    animate(root.querySelectorAll('[data-hero-in]'), {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(110, { start: 700 }),
      duration: DUR.base,
      ease: EASE.out,
    });
    return () => split.revert();
  }, []);

  return (
    <section ref={ref} className="case-hero">
      <div className="wrap case-hero-grid">
        <div>
          <a
            className="back"
            href="/#projects"
            data-hero-in
            onClick={(e) => {
              e.preventDefault();
              navigate('/#projects', { accent: project.accent, label: 'Projects' });
            }}
          >
            ← All projects
          </a>
          <p className="eyebrow" data-hero-in>
            {project.kind} · {project.status === 'shipped' ? 'Shipped' : 'In progress'}
          </p>
          <h1 data-split>{project.title}</h1>
          <p className="lede" data-hero-in>
            {project.tagline}
          </p>
          <p className="muted" data-hero-in>
            {project.summary}
          </p>
          <ul className="tags" data-hero-in>
            {[...project.stack, ...project.highlights].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {project.links && (
            <p data-hero-in>
              {project.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </p>
          )}
        </div>
        <div className="case-hero-art" aria-hidden="true">
          <SceneThumb illustration={project.illustration} variant="hero" />
        </div>
      </div>
    </section>
  );
}
