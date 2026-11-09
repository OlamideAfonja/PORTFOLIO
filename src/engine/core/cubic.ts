export interface Pt {
  x: number;
  y: number;
}
export interface Cubic {
  p0: Pt;
  p1: Pt;
  p2: Pt;
  p3: Pt;
}

export const cubicD = (c: Cubic) =>
  `M${c.p0.x} ${c.p0.y}C${c.p1.x} ${c.p1.y} ${c.p2.x} ${c.p2.y} ${c.p3.x} ${c.p3.y}`;

const bez = (c: Cubic, t: number, out: Pt) => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  out.x = a * c.p0.x + b * c.p1.x + d * c.p2.x + e * c.p3.x;
  out.y = a * c.p0.y + b * c.p1.y + d * c.p2.y + e * c.p3.y;
};

/**
 * Arc-length-parametrised lookup table for a cubic. Built once from the
 * control points (no DOM measuring, so it is SSR-safe), then `at(p)` is two
 * array reads and a lerp, with constant speed along the curve.
 */
export class PathSampler {
  private xs: Float32Array;
  private ys: Float32Array;
  private n: number;

  constructor(c: Cubic, n = 72) {
    this.n = n;
    this.xs = new Float32Array(n + 1);
    this.ys = new Float32Array(n + 1);
    const fine = n * 8;
    const px = new Float32Array(fine + 1);
    const py = new Float32Array(fine + 1);
    const cum = new Float32Array(fine + 1);
    const tmp: Pt = { x: 0, y: 0 };
    for (let i = 0; i <= fine; i++) {
      bez(c, i / fine, tmp);
      px[i] = tmp.x;
      py[i] = tmp.y;
      if (i > 0) cum[i] = cum[i - 1] + Math.hypot(px[i] - px[i - 1], py[i] - py[i - 1]);
    }
    const total = cum[fine] || 1;
    let j = 0;
    for (let i = 0; i <= n; i++) {
      const target = (i / n) * total;
      while (j < fine - 1 && cum[j + 1] < target) j++;
      const span = cum[j + 1] - cum[j] || 1;
      const k = (target - cum[j]) / span;
      this.xs[i] = px[j] + (px[j + 1] - px[j]) * k;
      this.ys[i] = py[j] + (py[j + 1] - py[j]) * k;
    }
  }

  at(p: number, out: Pt) {
    const f = Math.min(1, Math.max(0, p)) * this.n;
    const i = Math.min(this.n - 1, f | 0);
    const k = f - i;
    out.x = this.xs[i] + (this.xs[i + 1] - this.xs[i]) * k;
    out.y = this.ys[i] + (this.ys[i + 1] - this.ys[i]) * k;
  }
}
