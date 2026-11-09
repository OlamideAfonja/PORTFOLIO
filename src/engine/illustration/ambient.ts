import type { GraphIllustrationT, Step } from '@/content/schema';
import { rng } from '../core/rng';

/**
 * Procedural graph for the hero background: a jittered grid of nodes and a
 * random walk of packets across nearby links. It goes through the same
 * renderer as the real project diagrams.
 */
export function buildAmbient(seed = 7, cols = 6, rows = 3, walk = 16): GraphIllustrationT {
  const rand = rng(seed);
  const nodes: GraphIllustrationT['nodes'] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: `n${r * cols + c}`,
        label: '',
        x: 80 + (c * 840) / (cols - 1) + (rand() - 0.5) * 70,
        y: 70 + (r * 380) / (rows - 1) + (rand() - 0.5) * 60,
      });
    }
  }
  const steps: Step[] = [];
  let cur = nodes[Math.floor(rand() * nodes.length)];
  for (let i = 0; i < walk; i++) {
    const near = nodes.filter((n) => n.id !== cur.id && Math.hypot(n.x - cur.x, n.y - cur.y) < 300);
    const next = near[Math.floor(rand() * near.length)] ?? nodes[0];
    steps.push({ from: cur.id, to: next.id, label: '', caption: '', outcome: 'ok', duration: 760 });
    cur = next;
  }
  return { kind: 'graph', viewBox: [1000, 520], nodes, steps };
}
