'use client';
import Link from 'next/link';
import { useRef, type CSSProperties, type MouseEvent } from 'react';
import type { Project } from '@/content/schema';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { useCurtainRelease, useTransition } from '@/ui/providers/TransitionProvider';
import { revealAll } from '@/engine/motion/reveal';
import { CaseHero } from './CaseHero';
import { FlowStage } from './FlowStage';
import { ScenarioPlayer } from './ScenarioPlayer';

function Decisions({ project }: { project: Project }) {
  const ref = useMotionScope<HTMLElement>(revealAll, []);
  return (
    <section ref={ref} className="decisions wrap">
      <p className="eyebrow" data-reveal>
        Decisions
      </p>
      <h2 data-reveal>Choices and what they cost.</h2>
      <div className="dec-grid">
        {project.decisions.map((d, i) => (
          <article key={d.title} className="dec" data-reveal data-reveal-delay={(i % 2) * 110}>
            <h3>{d.title}</h3>
            <p>
              <span className="tag">Why</span> {d.why}
            </p>
            <p className="muted">
              <span className="tag">Cost</span> {d.cost}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Outro({ next }: { next: Project }) {
  const { navigate } = useTransition();
  const ref = useRef<HTMLAnchorElement>(null);
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(`/projects/${next.slug}`, {
      rect: ref.current!.getBoundingClientRect(),
      accent: next.accent,
      label: next.title,
    });
  };
  return (
    <section className="outro wrap">
      <Link
        ref={ref}
        href={`/projects/${next.slug}`}
        className="next"
        style={{ '--accent': next.accent } as CSSProperties}
        data-cursor="Next"
        onClick={go}
      >
        <span className="eyebrow">Next project</span>
        <span className="next-title">{next.title} →</span>
      </Link>
    </section>
  );
}

export function CaseStudy({ project, next }: { project: Project; next: Project }) {
  useCurtainRelease();
  return (
    <main className="case" style={{ '--accent': project.accent } as CSSProperties}>
      <CaseHero project={project} />
      <FlowStage project={project} />
      {project.scenarios && project.scenarios.length > 0 && <ScenarioPlayer project={project} />}
      <Decisions project={project} />
      <Outro next={next} />
    </main>
  );
}
