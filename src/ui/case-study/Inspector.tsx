'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { Project } from '@/content/schema';
import type { TableState } from '@/engine/inspector/reduce';
import { prefersReducedMotion } from '@/engine/motion/reducedMotion';

const rowSig = (cells: Record<string, string>) => JSON.stringify(cells);

/** Live tables. New or changed rows (vs the previous render) are marked fresh and animated in. */
export function Inspector({ inspector, state }: { inspector: NonNullable<Project['inspector']>; state: TableState }) {
  const root = useRef<HTMLDivElement>(null);
  const prev = useRef<Record<string, string>>({});

  const fresh = new Set<string>();
  const next: Record<string, string> = {};
  for (const t of inspector.tables)
    for (const r of state[t.id] ?? []) {
      const id = `${t.id}/${r.key}`;
      next[id] = rowSig(r.cells);
      if (prev.current[id] !== next[id]) fresh.add(id);
    }

  useEffect(() => {
    prev.current = next;
    if (prefersReducedMotion() || !root.current) return;
    const rows = root.current.querySelectorAll('[data-fresh="1"]');
    if (!rows.length) return;
    const a = animate(rows, {
      opacity: [0, 1],
      translateX: [-16, 0],
      delay: stagger(70),
      duration: 520,
      ease: 'outExpo',
    });
    return () => {
      a.cancel();
    };
  });

  return (
    <div ref={root} className="inspector" aria-label="Database state">
      {inspector.tables.map((t) => {
        const rows = state[t.id] ?? [];
        return (
          <div key={t.id} className="itable">
            <h4>{t.title}</h4>
            <table>
              <thead>
                <tr>
                  {t.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr className="empty">
                    <td colSpan={t.columns.length}>empty</td>
                  </tr>
                )}
                {rows.map((r) => {
                  const id = `${t.id}/${r.key}`;
                  return (
                    <tr key={r.key} data-fresh={fresh.has(id) ? '1' : '0'} className={fresh.has(id) ? 'fresh' : ''}>
                      {t.columns.map((c) => (
                        <td key={c}>{r.cells[c] ?? ''}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
