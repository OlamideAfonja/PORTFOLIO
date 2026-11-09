export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Fade in over the first `edge` of p, out over the last `edge`. 0 at both ends. */
export const edgeFade = (p: number, edge = 0.1) => Math.max(0, Math.min(1, p / edge, (1 - p) / edge));
