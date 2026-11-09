'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { site } from '@/content/site';

export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const range = h.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    on();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <header className="nav">
      <Link href="/" className="brand">
        {site.name}
      </Link>
      <nav>
        <Link href="/#projects">Projects</Link>
        <Link href="/#path">Path</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
      <div ref={bar} className="nav-progress" />
    </header>
  );
}
