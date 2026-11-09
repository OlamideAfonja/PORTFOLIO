import type { Step } from '@/content/schema';
import type { Schedule } from '../core/schedule';

export interface SceneOptions {
  /** Overrides the illustration's own steps (used by failure scenarios). */
  steps?: Step[];
  /** Thumbnail mode: text hidden, thinner strokes. */
  compact?: boolean;
  /** How many past steps keep a visible trail. Infinity keeps all of them. */
  trail?: number;
  className?: string;
}

/**
 * A scene is an SVG plus a pure paint(time) function. Nothing about the
 * picture is stored between frames, so it can be driven by a loop, a one-shot
 * play, or scroll scrubbing in either direction and always look right.
 */
export interface Scene {
  svg: SVGSVGElement;
  schedule: Schedule;
  steps: Step[];
  paint(time: number): void;
  destroy(): void;
}
