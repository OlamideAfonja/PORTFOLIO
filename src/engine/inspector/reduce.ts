import type { Op, Project } from '@/content/schema';

export interface Row {
  key: string;
  cells: Record<string, string>;
}
export type TableState = Record<string, Row[]>;

/**
 * State of every inspector table after step `stepIndex`. A pure reduction over
 * the step operations, so scrubbing backwards is correct by construction: the
 * view is derived from the step index, never mutated incrementally.
 * For a scenario, the base is the final state of the main flow.
 */
export function stateAt(project: Project, stepIndex: number, scenarioId?: string): TableState {
  const tables: TableState = {};
  for (const t of project.inspector?.tables ?? []) tables[t.id] = [];

  const apply = (ops?: Op[]) => {
    for (const op of ops ?? []) {
      const rows = tables[op.table];
      if (!rows) continue;
      if (op.op === 'insert') {
        rows.push({ key: op.key, cells: { ...op.row } });
      } else if (op.op === 'update') {
        const r = rows.find((x) => x.key === op.key);
        if (r) Object.assign(r.cells, op.set);
      } else {
        const i = rows.findIndex((x) => x.key === op.key);
        if (i >= 0) rows.splice(i, 1);
      }
    }
  };

  const scenario = scenarioId ? project.scenarios?.find((s) => s.id === scenarioId) : undefined;
  if (scenario) {
    project.illustration.steps.forEach((s) => apply(s.ops));
    scenario.steps.slice(0, stepIndex + 1).forEach((s) => apply(s.ops));
  } else {
    project.illustration.steps.slice(0, stepIndex + 1).forEach((s) => apply(s.ops));
  }
  return tables;
}
