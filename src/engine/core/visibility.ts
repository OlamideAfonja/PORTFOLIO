const callbacks = new WeakMap<Element, (visible: boolean) => void>();
let io: IntersectionObserver | null = null;

function observer() {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) callbacks.get(e.target)?.(e.isIntersecting);
      },
      { rootMargin: '160px 0px' },
    );
  }
  return io;
}

/** One shared IntersectionObserver for every ambient loop on the page. */
export function observeVisible(el: Element, cb: (visible: boolean) => void): () => void {
  callbacks.set(el, cb);
  observer().observe(el);
  return () => {
    io?.unobserve(el);
    callbacks.delete(el);
  };
}
