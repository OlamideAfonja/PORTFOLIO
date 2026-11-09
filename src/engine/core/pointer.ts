export interface PointerState {
  x: number;
  y: number;
  /** normalised -1..1 across the viewport */
  nx: number;
  ny: number;
}
type Sub = (s: PointerState) => void;

const subs = new Set<Sub>();
const state: PointerState = { x: -100, y: -100, nx: 0, ny: 0 };
let tx = -100;
let ty = -100;
let raf = 0;
let attached = false;
let seeded = false;

export const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tick() {
  raf = 0;
  if (!seeded) {
    state.x = tx;
    state.y = ty;
    seeded = true;
  } else {
    state.x += (tx - state.x) * 0.2;
    state.y += (ty - state.y) * 0.2;
  }
  state.nx = (state.x / window.innerWidth) * 2 - 1;
  state.ny = (state.y / window.innerHeight) * 2 - 1;
  subs.forEach((fn) => fn(state));
  if (Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1) raf = requestAnimationFrame(tick);
}

function onMove(e: PointerEvent) {
  tx = e.clientX;
  ty = e.clientY;
  if (!raf) raf = requestAnimationFrame(tick);
}

/** One window listener and one rAF integrator shared by cursor, parallax, magnetic button. */
export function subscribePointer(fn: Sub): () => void {
  if (!hasFinePointer()) return () => {};
  subs.add(fn);
  if (!attached) {
    window.addEventListener('pointermove', onMove, { passive: true });
    attached = true;
  }
  return () => {
    subs.delete(fn);
    if (!subs.size && attached) {
      window.removeEventListener('pointermove', onMove);
      attached = false;
      cancelAnimationFrame(raf);
      raf = 0;
      seeded = false;
    }
  };
}
