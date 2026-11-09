'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { Step } from '@/content/schema';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';

export function StepRail({ steps, active }: { steps: Step[]; active: number }) {
  return (
    <ol className="rail" aria-label="Steps">
      {steps.map((s, i) => (
        <li key={i} data-state={i < active ? 'done' : i === active ? 'active' : 'todo'}>
          <span className="rail-n">{String(i + 1).padStart(2, '0')}</span>
          <span className="rail-l">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function StepCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const a = animate(ref.current.children, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(70),
      duration: 440,
      ease: 'outQuad',
    });
    return () => {
      a.cancel();
    };
  }, [index]);
  return (
    <div className={`stepcard ${step.outcome === 'blocked' ? 'blocked' : ''}`} aria-live="polite">
      <div ref={ref}>
        <span className="step-count">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          {step.outcome === 'blocked' ? ' · blocked' : ''}
        </span>
        <strong>{step.label}</strong>
        <p>{step.caption}</p>
        {step.payload && <pre>{step.payload}</pre>}
      </div>
    </div>
  );
}
