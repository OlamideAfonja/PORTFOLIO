import { z } from 'zod';
import { ProjectSchema, type Project } from '../schema';
import { fintech } from './fintech';
import { insighta } from './insighta';
import { designjacks } from './designjacks';
import { agent } from './agent';

// Parsed at module load: a malformed spec fails the build, not the browser.
export const projects: Project[] = z.array(ProjectSchema).parse([fintech, insighta, designjacks, agent]);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const getNext = (slug: string): Project => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
