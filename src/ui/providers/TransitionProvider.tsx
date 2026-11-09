'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';
import { FULL, bottomEdge, rectInset, topEdge, tweenInset } from '@/engine/transition/curtain';

interface NavigateOpts {
  rect?: DOMRect;
  accent?: string;
  label?: string;
}
interface Ctx {
  navigate(href: string, opts?: NavigateOpts): void;
  release(): void;
}

const TransitionCtx = createContext<Ctx>({ navigate: () => {}, release: () => {} });
export const useTransition = () => useContext(TransitionCtx);

/**
 * The curtain lives in the root layout, which persists across route changes,
 * so one DOM node survives the navigation: it grows from the clicked card,
 * the route swaps underneath, then the destination releases it.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const waiting = useRef(false);
  const failsafe = useRef(0);

  const release = useCallback(async () => {
    if (!waiting.current) return;
    waiting.current = false;
    window.clearTimeout(failsafe.current);
    const el = curtain.current;
    if (!el) return;
    await tweenInset(el, FULL, topEdge(), 700, 'inOutExpo');
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
    busy.current = false;
  }, []);

  const navigate = useCallback(
    async (href: string, opts: NavigateOpts = {}) => {
      if (busy.current) return;
      const el = curtain.current;
      if (!el || prefersReducedMotion()) {
        router.push(href);
        return;
      }
      busy.current = true;
      el.style.background = opts.accent ?? '#7cf5c4';
      if (labelEl.current) labelEl.current.textContent = opts.label ?? '';
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
      await tweenInset(el, opts.rect ? rectInset(opts.rect) : bottomEdge(), FULL, opts.rect ? 720 : 600, 'inOutExpo');
      waiting.current = true;
      router.push(href);
      failsafe.current = window.setTimeout(() => void release(), 2400);
    },
    [router, release],
  );

  const value = useMemo(() => ({ navigate, release: () => void release() }), [navigate, release]);

  return (
    <TransitionCtx.Provider value={value}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <span ref={labelEl} className="curtain-label" />
      </div>
    </TransitionCtx.Provider>
  );
}

/** Call once per page: releases the curtain after fonts are ready (or 700ms). */
export function useCurtainRelease() {
  const { release } = useTransition();
  useEffect(() => {
    let alive = true;
    const fonts = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 700))]).then(() => {
      if (alive) release();
    });
    return () => {
      alive = false;
    };
  }, [release]);
}
