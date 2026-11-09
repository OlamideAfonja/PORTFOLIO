import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNext, getProject, projects } from '@/content/projects';
import { CaseStudy } from '@/ui/case-study/CaseStudy';

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: `${p.title} · Olamide Afonja`, description: p.tagline } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseStudy project={project} next={getNext(slug)} />;
}
