'use client';
import { useEffect, useRef } from 'react';
import { hasFinePointer, subscribePointer } from '@/engine/core/pointer';

/** Trailing ring; grows and shows a label over any element with data-cursor="Label". */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!hasFinePointer()) return;
    const el = ref.current!;
    el.dataset.on = '1';
    const off = subscribePointer((s) => {
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      el.dataset.mode = t ? 'label' : '';
      if (text.current) text.current.textContent = t?.dataset.cursor ?? '';
    };
    document.addEventListener('pointerover', over, { passive: true });
    return () => {
      off();
      document.removeEventListener('pointerover', over);
    };
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span ref={text} />
    </div>
  );
}
