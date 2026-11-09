'use client';
import type { Project } from '@/content/schema';
import { useMotionScope } from '@/ui/hooks/useMotionScope';
import { revealAll } from '@/engine/motion/reveal';
import { ProjectCard } from './ProjectCard';

export function Projects({ projects }: { projects: Project[] }) {
  const ref = useMotionScope<HTMLElement>(revealAll, []);
  return (
    <section ref={ref} id="projects" className="section">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Projects
        </p>
        <h2 data-reveal>Systems I&apos;ve built. Open one to watch it run.</h2>
        <div className="cards">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
