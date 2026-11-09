import { useEffect, useRef, type DependencyList } from 'react';
import { createScope } from 'animejs';

/**
 * Owns the lifecycle of everything Anime creates inside `setup`.
 * Strict Mode mounts effects twice in dev, so cleanup must be complete.
 */
export function useMotionScope<T extends HTMLElement>(
  setup: (root: T) => void | (() => void),
  deps: DependencyList = [],
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cleanup: void | (() => void);
    const scope = createScope({ root }).add(() => {
      cleanup = setup(root);
    });
    return () => {
      cleanup?.();
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
