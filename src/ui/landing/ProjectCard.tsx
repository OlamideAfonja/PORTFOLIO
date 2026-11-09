'use client';
import Link from 'next/link';
import { useRef, useState, type MouseEvent, type PointerEvent, type CSSProperties } from 'react';
import type { Project } from '@/content/schema';
import { SceneThumb } from '@/ui/SceneThumb';
import { useTransition } from '@/ui/providers/TransitionProvider';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { navigate } = useTransition();
  const ref = useRef<HTMLAnchorElement>(null);
  const [hot, setHot] = useState(false);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(`/projects/${project.slug}`, {
      rect: ref.current!.getBoundingClientRect(),
      accent: project.accent,
      label: project.title,
    });
  };

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current!;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    setHot(false);
  };

  return (
    <Link
      ref={ref}
      href={`/projects/${project.slug}`}
      className="card"
      data-reveal
      data-reveal-delay={(index % 2) * 120}
      data-cursor="View"
      style={{ '--accent': project.accent } as CSSProperties}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={onLeave}
    >
      <div className="card-top">
        <span className="eyebrow">{project.kind}</span>
        <span className={`pill ${project.status}`}>{project.status === 'shipped' ? 'Shipped' : 'In progress'}</span>
      </div>
      <SceneThumb illustration={project.illustration} fast={hot} />
      <h3>{project.title}</h3>
      <p className="muted">{project.tagline}</p>
      <ul className="tags">
        {project.stack.slice(0, 4).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <span className="card-cta">
        Open case study <span className="arrow">→</span>
      </span>
    </Link>
  );
}
