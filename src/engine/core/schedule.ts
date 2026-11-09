export interface Schedule {
  starts: number[];
  durations: number[];
  total: number;
}

export const GAP = 260;
export const TAIL = 520;
export const DEFAULT_DURATION = 900;

export function makeSchedule(steps: { duration?: number }[]): Schedule {
  const starts: number[] = [];
  const durations: number[] = [];
  let t = 0;
  for (const s of steps) {
    const d = s.duration ?? DEFAULT_DURATION;
    starts.push(t);
    durations.push(d);
    t += d + GAP;
  }
  return { starts, durations, total: t - GAP + TAIL };
}

/** Index of the last step that has started at `time` (0 before anything starts). */
export function stepAt(s: Schedule, time: number): number {
  let idx = 0;
  for (let i = 0; i < s.starts.length; i++) if (time >= s.starts[i]) idx = i;
  return idx;
}
