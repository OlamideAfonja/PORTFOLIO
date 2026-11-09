import type { GraphIllustrationT, Step } from '@/content/schema';
import { clamp01, edgeFade, inOutCubic } from '../core/ease';
import { cubicD, PathSampler, type Cubic, type Pt } from '../core/cubic';
import { makeSchedule, stepAt } from '../core/schedule';
import { el, put, trailOpacity } from './dom';
import type { Scene, SceneOptions } from './types';

const W = 168;
const H = 66;

function geometry(a: Pt, b: Pt): Cubic {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const mx = (a.x + b.x) / 2;
    return { p0: a, p1: { x: mx, y: a.y }, p2: { x: mx, y: b.y }, p3: b };
  }
  const my = (a.y + b.y) / 2;
  return { p0: a, p1: { x: a.x, y: my }, p2: { x: b.x, y: my }, p3: b };
}

export function createGraphScene(host: HTMLElement, ill: GraphIllustrationT, opts: SceneOptions = {}): Scene {
  const steps: Step[] = opts.steps ?? ill.steps;
  const schedule = makeSchedule(steps);
  const trail = opts.trail ?? Infinity;
  const [vw, vh] = ill.viewBox;
  const nodes = new Map(ill.nodes.map((n) => [n.id, n]));

  const svg = el('svg', {
    viewBox: `0 0 ${vw} ${vh}`,
    class: ['diagram-svg', opts.compact ? 'compact' : '', opts.className ?? ''].join(' ').trim(),
    role: 'img',
    'aria-label': `Flow diagram: ${steps.map((s) => s.label).filter(Boolean).join(', ')}`,
  });

  // Base edges come from the main flow plus whatever this scene plays.
  const baseLayer = el('g', {}, svg);
  const seen = new Set<string>();
  for (const s of [...ill.steps, ...steps]) {
    const key = [s.from, s.to].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    el('path', { d: cubicD(geometry(nodes.get(s.from)!, nodes.get(s.to)!)), class: 'edge' }, baseLayer);
  }

  // Per-step lit overlay (oriented from -> to) and packet.
  const litLayer = el('g', {}, svg);
  const lit: SVGPathElement[] = [];
  const samplers: PathSampler[] = [];
  for (const s of steps) {
    const c = geometry(nodes.get(s.from)!, nodes.get(s.to)!);
    samplers.push(new PathSampler(c));
    lit.push(
      el(
        'path',
        {
          d: cubicD(c),
          class: s.outcome === 'blocked' ? 'edge-lit blocked' : 'edge-lit',
          pathLength: 1,
          'stroke-dasharray': 1,
          'stroke-dashoffset': 1,
          opacity: 0,
        },
        litLayer,
      ),
    );
  }

  const glow = new Map<string, SVGRectElement>();
  const block = new Map<string, SVGGElement>();
  const nodeLayer = el('g', {}, svg);
  for (const n of ill.nodes) {
    const g = el('g', { class: 'node', transform: `translate(${n.x - W / 2} ${n.y - H / 2})` }, nodeLayer);
    glow.set(n.id, el('rect', { width: W + 10, height: H + 10, x: -5, y: -5, rx: 16, class: 'node-glow', opacity: 0 }, g));
    el('rect', { width: W, height: H, rx: 12, class: 'node-box' }, g);
    const label = el('text', { x: W / 2, y: n.sub ? 29 : 39, class: 'node-label' }, g);
    label.textContent = n.label;
    if (n.sub) {
      const sub = el('text', { x: W / 2, y: 49, class: 'node-sub' }, g);
      sub.textContent = n.sub;
    }
    const b = el('g', { class: 'node-block', opacity: 0 }, g);
    el('rect', { width: W + 10, height: H + 10, x: -5, y: -5, rx: 16, class: 'node-block-ring' }, b);
    const x = el('text', { x: W - 6, y: 6, class: 'node-x' }, b);
    x.textContent = '×';
    block.set(n.id, b);
  }

  const packetLayer = el('g', {}, svg);
  const packets = steps.map((s) => {
    const g = el('g', { class: s.outcome === 'blocked' ? 'packet blocked' : 'packet', opacity: 0 }, packetLayer);
    el('circle', { r: 7 }, g);
    const t = el('text', { y: -17, class: 'packet-label' }, g);
    t.textContent = s.label;
    return g;
  });

  host.appendChild(svg);

  const tmp: Pt = { x: 0, y: 0 };
  const prog = (time: number, i: number) => clamp01((time - schedule.starts[i]) / schedule.durations[i]);

  function paint(time: number) {
    const cur = stepAt(schedule, time);
    const lp = prog(time, cur);

    const visited = new Set<string>([steps[0].from]);
    for (let i = 0; i <= cur; i++) if (i < cur || lp >= 1) visited.add(steps[i].to);
    const active = lp < 1 ? steps[cur].from : steps[cur].to;
    const blockedNode = steps[cur].outcome === 'blocked' && lp >= 0.98 ? steps[cur].to : '';

    for (const [id, g] of glow) put(g, 'opacity', id === active ? 1 : visited.has(id) ? 0.35 : 0);
    for (const [id, g] of block) put(g, 'opacity', id === blockedNode ? 1 : 0);

    for (let i = 0; i < steps.length; i++) {
      const p = prog(time, i);
      const started = time >= schedule.starts[i];
      put(lit[i], 'stroke-dashoffset', (1 - inOutCubic(p)).toFixed(4));
      put(lit[i], 'opacity', started ? trailOpacity(cur - i, trail).toFixed(3) : 0);

      const pk = packets[i];
      const flying = started && p > 0 && p < 1;
      put(pk, 'opacity', flying ? edgeFade(p, 0.12).toFixed(3) : 0);
      if (flying) {
        samplers[i].at(inOutCubic(p), tmp);
        put(pk, 'transform', `translate(${tmp.x.toFixed(1)} ${tmp.y.toFixed(1)})`);
      }
    }
  }

  return { svg, schedule, steps, paint, destroy: () => svg.remove() };
}
