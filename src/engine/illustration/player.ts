import { animate, type JSAnimation } from 'animejs';
import type { Illustration } from '@/content/schema';
import { createScene } from './registry';
import type { Scene, SceneOptions } from './types';

export interface LoopHandle {
  scene: Scene;
  anim: JSAnimation;
  destroy(): void;
}

/**
 * Anime.js is the clock; the scene is a pure function of that clock. The
 * loop starts paused so callers can gate it on visibility.
 */
export function mountLoop(host: HTMLElement, ill: Illustration, opts: SceneOptions = {}): LoopHandle {
  const scene = createScene(host, ill, opts);
  const clock = { t: 0 };
  scene.paint(0);
  const anim = animate(clock, {
    t: [0, scene.schedule.total],
    duration: scene.schedule.total,
    ease: 'linear',
    loop: true,
    autoplay: false,
    onUpdate: () => scene.paint(clock.t),
  });
  return {
    scene,
    anim,
    destroy: () => {
      anim.cancel();
      scene.destroy();
    },
  };
}
