const NS = 'http://www.w3.org/2000/svg';

export function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent?.appendChild(n);
  return n;
}

const cache = new WeakMap<Element, Record<string, string>>();

/** setAttribute that skips the write when the value has not changed. */
export function put(node: Element, name: string, value: string | number) {
  const v = String(value);
  let c = cache.get(node);
  if (!c) {
    c = {};
    cache.set(node, c);
  }
  if (c[name] !== v) {
    c[name] = v;
    node.setAttribute(name, v);
  }
}

export const trailOpacity = (gap: number, trail: number) => {
  if (gap <= 0) return 1;
  if (!Number.isFinite(trail)) return 0.42;
  return Math.max(0, 0.5 - (gap - 1) * (0.5 / Math.max(1, trail)));
};
