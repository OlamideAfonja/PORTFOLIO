'use client';
import { path } from '@/content/site';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { revealAll } from '@/engine/motion/reveal';
import { bindProgress } from '@/engine/motion/progress';

export function Path() {
  const ref = useMotionScope<HTMLElement>((root) => {
    const rail = root.querySelector<HTMLElement>('[data-rail]')!;
    const stopProgress = bindProgress(root, (p) => rail.style.setProperty('--prog', p.toFixed(4)), { mode: 'pass', smooth: 0.18 });
    const stopReveal = revealAll(root);
    return () => {
      stopProgress();
      stopReveal();
    };
  }, []);
  return (
    <section ref={ref} id="path" className="section">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Path
        </p>
        <h2 data-reveal>Where I&apos;ve worked.</h2>
        <div className="path" data-rail>
          <div className="path-line">
            <div className="path-fill" />
          </div>
          <ol>
            {path.map((p) => (
              <li key={p.role + p.org} data-reveal>
                <span className="when">{p.when}</span>
                <div>
                  <strong>{p.role}</strong>
                  <span className="muted"> · {p.org}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
