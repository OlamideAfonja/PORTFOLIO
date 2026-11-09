'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import type { Project } from '@/content/schema';
import { createScene } from '@/engine/illustration/registry';
import { stateAt } from '@/engine/inspector/reduce';
import { stepAt } from '@/engine/core/schedule';
import { bindProgress } from '@/engine/motion/progress';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { Inspector } from './Inspector';
import { StepCard, StepRail } from './StepViews';

/**
 * Scroll-scrubbed stage. Per-frame work (scene paint, progress variable) goes
 * straight to the DOM; React state changes only when the integer step changes.
 */
export function FlowStage({ project }: { project: Project }) {
  const ill = project.illustration;
  const [step, setStep] = useState(0);

  const ref = useMotionScope<HTMLElement>(
    (root) => {
      const host = root.querySelector<HTMLElement>('[data-stage]')!;
      const scene = createScene(host, ill);
      if (prefersReducedMotion()) {
        scene.paint(scene.schedule.total);
        setStep(ill.steps.length - 1);
        return () => scene.destroy();
      }
      let last = -1;
      const stop = bindProgress(
        root,
        (p) => {
          const t = p * scene.schedule.total;
          scene.paint(t);
          root.style.setProperty('--p', p.toFixed(4));
          const i = stepAt(scene.schedule, t);
          if (i !== last) {
            last = i;
            setStep(i);
          }
        },
        { mode: 'pin', smooth: 0.14 },
      );
      return () => {
        stop();
        scene.destroy();
      };
    },
    [ill],
  );

  const state = useMemo(() => stateAt(project, step), [project, step]);

  return (
    <section ref={ref} className="flow" style={{ '--steps': ill.steps.length } as CSSProperties}>
      <div className="flow-sticky wrap">
        <header>
          <p className="eyebrow">The flow</p>
          <h2>{project.flowHeading}</h2>
        </header>
        <div className={`flow-grid ${project.inspector ? '' : 'no-inspector'}`}>
          <StepRail steps={ill.steps} active={step} />
          <div className="flow-center">
            <div className="stage" data-stage />
            <StepCard step={ill.steps[step]} index={step} total={ill.steps.length} />
          </div>
          {project.inspector && <Inspector inspector={project.inspector} state={state} />}
        </div>
      </div>
    </section>
  );
}
