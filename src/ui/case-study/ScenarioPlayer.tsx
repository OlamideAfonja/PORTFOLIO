'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'animejs';
import type { Project } from '@/content/schema';
import { observeVisible } from '@/engine/core/visibility';
import { stepAt } from '@/engine/core/schedule';
import { createScene } from '@/engine/illustration/registry';
import { stateAt } from '@/engine/inspector/reduce';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';
import { Inspector } from './Inspector';
import { StepCard } from './StepViews';

export function ScenarioPlayer({ project }: { project: Project }) {
  const scenarios = project.scenarios!;
  const [active, setActive] = useState(scenarios[0].id);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const scenario = scenarios.find((s) => s.id === active)!;

  useEffect(() => observeVisible(section.current!, (v) => v && setSeen(true)), []);

  useEffect(() => {
    const el = host.current!;
    const scene = createScene(el, project.illustration, { steps: scenario.steps });
    setStep(0);
    if (prefersReducedMotion()) {
      scene.paint(scene.schedule.total);
      setStep(scenario.steps.length - 1);
      return () => scene.destroy();
    }
    scene.paint(0);
    if (!seen) return () => scene.destroy();
    const clock = { t: 0 };
    let last = -1;
    const anim = animate(clock, {
      t: [0, scene.schedule.total],
      duration: scene.schedule.total,
      ease: 'linear',
      onUpdate: () => {
        scene.paint(clock.t);
        const i = stepAt(scene.schedule, clock.t);
        if (i !== last) {
          last = i;
          setStep(i);
        }
      },
    });
    return () => {
      anim.cancel();
      scene.destroy();
    };
  }, [project, scenario, run, seen]);

  const state = useMemo(() => stateAt(project, step, active), [project, step, active]);
  const s = scenario.steps[Math.min(step, scenario.steps.length - 1)];

  return (
    <section ref={section} className="scenarios wrap">
      <p className="eyebrow">When things go wrong</p>
      <h2>Same system, with a failure injected.</h2>
      <div className="scn-grid">
        <div className="scn-tabs" role="tablist">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              role="tab"
              aria-selected={sc.id === active}
              className={sc.id === active ? 'on' : ''}
              onClick={() => {
                setActive(sc.id);
                setRun((r) => r + 1);
              }}
            >
              <strong>{sc.title}</strong>
              <span>{sc.blurb}</span>
            </button>
          ))}
          <button className="replay" onClick={() => setRun((r) => r + 1)}>
            ↻ Replay
          </button>
        </div>
        <div className="flow-center">
          <div ref={host} className="stage" />
          <StepCard step={s} index={Math.min(step, scenario.steps.length - 1)} total={scenario.steps.length} />
        </div>
        {project.inspector && <Inspector inspector={project.inspector} state={state} />}
      </div>
    </section>
  );
}
