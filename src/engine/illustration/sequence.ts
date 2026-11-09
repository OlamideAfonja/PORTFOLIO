import type { SequenceIllustrationT, Step } from '@/content/schema';
import { clamp01, edgeFade, inOutCubic } from '../core/ease';
import { cubicD, PathSampler, type Cubic, type Pt } from '../core/cubic';
import { makeSchedule, stepAt } from '../core/schedule';
import { el, put, trailOpacity } from './dom';
import type { Scene, SceneOptions } from './types';

const VW = 1000;
const TOP = 150;
const ROW = 74;

export function createSequenceScene(host: HTMLElement, ill: SequenceIllustrationT, opts: SceneOptions = {}): Scene {
  const steps: Step[] = opts.steps ?? ill.steps;
  const schedule = makeSchedule(steps);
  const trail = opts.trail ?? Infinity;
  const n = ill.actors.length;
  const rows = Math.max(steps.length, ill.steps.length);
  const VH = TOP + rows * ROW + 30;

  const svg = el('svg', {
    viewBox: `0 0 ${VW} ${VH}`,
    class: ['diagram-svg', 'sequence', opts.compact ? 'compact' : '', opts.className ?? ''].join(' ').trim(),
    role: 'img',
    'aria-label': `Sequence diagram: ${steps.map((s) => s.label).filter(Boolean).join(', ')}`,
  });

  const ax = new Map(ill.actors.map((a, i) => [a.id, 120 + (i * (VW - 240)) / (n - 1)]));

  const lifeLayer = el('g', {}, svg);
  const headers = new Map<string, SVGRectElement>();
  for (const a of ill.actors) {
    const x = ax.get(a.id)!;
    el('line', { x1: x, y1: 90, x2: x, y2: VH - 14, class: 'lifeline' }, lifeLayer);
    const g = el('g', { class: 'actor', transform: `translate(${x - 78} 22)` }, lifeLayer);
    headers.set(a.id, el('rect', { width: 156, height: 62, x: -4, y: -4, rx: 16, class: 'node-glow', opacity: 0, transform: 'translate(0 0)' }, g));
    el('rect', { width: 148, height: 54, rx: 12, class: 'node-box' }, g);
    const t = el('text', { x: 74, y: a.sub ? 25 : 33, class: 'node-label' }, g);
    t.textContent = a.label;
    if (a.sub) {
      const s = el('text', { x: 74, y: 43, class: 'node-sub' }, g);
      s.textContent = a.sub;
    }
  }

  const msgLayer = el('g', {}, svg);
  const lines: SVGPathElement[] = [];
  const heads: SVGPathElement[] = [];
  const crosses: SVGTextElement[] = [];
  const labels: SVGTextElement[] = [];
  const samplers: PathSampler[] = [];

  steps.forEach((s, i) => {
    const y = TOP + i * ROW;
    const x1 = ax.get(s.from)!;
    const x2 = ax.get(s.to)!;
    const self = s.from === s.to;
    const blocked = s.outcome === 'blocked';
    let c: Cubic;
    let tip: Pt;
    let angle: number;
    if (self) {
      c = { p0: { x: x1, y }, p1: { x: x1 + 96, y: y - 8 }, p2: { x: x1 + 96, y: y + 34 }, p3: { x: x1, y: y + 30 } };
      tip = c.p3;
      angle = 180;
    } else {
      c = { p0: { x: x1, y }, p1: { x: x1 + (x2 - x1) / 3, y }, p2: { x: x1 + (2 * (x2 - x1)) / 3, y }, p3: { x: x2, y } };
      tip = c.p3;
      angle = x2 > x1 ? 0 : 180;
    }
    samplers.push(new PathSampler(c));

    lines.push(
      el(
        'path',
        {
          d: cubicD(c),
          class: blocked ? 'msg blocked' : 'msg',
          pathLength: 1,
          'stroke-dasharray': 1,
          'stroke-dashoffset': 1,
          opacity: 0,
        },
        msgLayer,
      ),
    );
    heads.push(
      el(
        'path',
        { d: 'M0 0L-10 -6L-10 6Z', class: 'msg-head', transform: `translate(${tip.x} ${tip.y}) rotate(${angle})`, opacity: 0 },
        msgLayer,
      ),
    );
    const cross = el('text', { x: tip.x + (angle === 0 ? -14 : 14), y: tip.y + 6, class: 'msg-x', opacity: 0 }, msgLayer);
    cross.textContent = '×';
    crosses.push(cross);

    const lx = self ? x1 + 108 : (x1 + x2) / 2;
    const label = el('text', { x: lx, y: self ? y + 14 : y - 12, class: self ? 'msg-label left' : 'msg-label', opacity: 0 }, msgLayer);
    label.textContent = s.label;
    labels.push(label);
  });

  const packetLayer = el('g', {}, svg);
  const packets = steps.map((s) => {
    const g = el('g', { class: s.outcome === 'blocked' ? 'packet blocked' : 'packet', opacity: 0 }, packetLayer);
    el('circle', { r: 7 }, g);
    return g;
  });

  host.appendChild(svg);

  const tmp: Pt = { x: 0, y: 0 };
  const prog = (time: number, i: number) => clamp01((time - schedule.starts[i]) / schedule.durations[i]);

  function paint(time: number) {
    const cur = stepAt(schedule, time);
    for (const [id, g] of headers) {
      const involved = steps[cur].from === id || steps[cur].to === id;
      put(g, 'opacity', involved ? 1 : 0);
    }
    for (let i = 0; i < steps.length; i++) {
      const p = prog(time, i);
      const started = time >= schedule.starts[i];
      const op = started ? trailOpacity(cur - i, trail).toFixed(3) : 0;
      const blocked = steps[i].outcome === 'blocked';
      put(lines[i], 'stroke-dashoffset', (1 - inOutCubic(p)).toFixed(4));
      put(lines[i], 'opacity', op);
      put(heads[i], 'opacity', p >= 1 && !blocked ? op : 0);
      put(crosses[i], 'opacity', p >= 1 && blocked ? op : 0);
      put(labels[i], 'opacity', op);

      const flying = started && p > 0 && p < 1;
      put(packets[i], 'opacity', flying ? edgeFade(p, 0.12).toFixed(3) : 0);
      if (flying) {
        samplers[i].at(inOutCubic(p), tmp);
        put(packets[i], 'transform', `translate(${tmp.x.toFixed(1)} ${tmp.y.toFixed(1)})`);
      }
    }
  }

  return { svg, schedule, steps, paint, destroy: () => svg.remove() };
}
