import type { Illustration } from '@/content/schema';
import { createGraphScene } from './graph';
import { createSequenceScene } from './sequence';
import type { Scene, SceneOptions } from './types';

/** kind -> renderer. Adding an illustration kind means adding one entry here. */
export function createScene(host: HTMLElement, ill: Illustration, opts: SceneOptions = {}): Scene {
  switch (ill.kind) {
    case 'graph':
      return createGraphScene(host, ill, opts);
    case 'sequence':
      return createSequenceScene(host, ill, opts);
  }
}
