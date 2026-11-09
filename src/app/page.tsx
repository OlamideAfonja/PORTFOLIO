import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { Hero } from '@/ui/landing/Hero';
import { Marquee } from '@/ui/landing/Marquee';
import { Projects } from '@/ui/landing/Projects';
import { Path } from '@/ui/landing/Path';
import { Contact } from '@/ui/landing/Contact';

export default function Page() {
  return (
    <main>
      <Hero />
      <Marquee items={site.stack} />
      <Projects projects={projects} />
      <Path />
      <Contact />
    </main>
  );
}
