import { z } from 'zod';

const Id = z.string().min(1);
const Cells = z.record(z.string(), z.string());

export const OpSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('insert'), table: Id, key: Id, row: Cells }),
  z.object({ op: z.literal('update'), table: Id, key: Id, set: Cells }),
  z.object({ op: z.literal('remove'), table: Id, key: Id }),
]);

export const StepSchema = z.object({
  from: Id,
  to: Id,
  label: z.string(),
  caption: z.string(),
  payload: z.string().optional(),
  ops: z.array(OpSchema).optional(),
  outcome: z.enum(['ok', 'blocked']).default('ok'),
  duration: z.number().positive().optional(),
});

const NodeSchema = z.object({
  id: Id,
  label: z.string(),
  sub: z.string().optional(),
  x: z.number(),
  y: z.number(),
});

const ActorSchema = z.object({ id: Id, label: z.string(), sub: z.string().optional() });

const GraphIllustration = z.object({
  kind: z.literal('graph'),
  viewBox: z.tuple([z.number(), z.number()]),
  nodes: z.array(NodeSchema).min(2),
  steps: z.array(StepSchema).min(1),
});

const SequenceIllustration = z.object({
  kind: z.literal('sequence'),
  actors: z.array(ActorSchema).min(2),
  steps: z.array(StepSchema).min(1),
});

export const IllustrationSchema = z.discriminatedUnion('kind', [
  GraphIllustration,
  SequenceIllustration,
]);

const ScenarioSchema = z.object({
  id: Id,
  title: z.string(),
  blurb: z.string(),
  steps: z.array(StepSchema).min(1),
});

const InspectorSchema = z.object({
  tables: z.array(z.object({ id: Id, title: z.string(), columns: z.array(z.string()).min(1) })).min(1),
});

const DecisionSchema = z.object({ title: z.string(), why: z.string(), cost: z.string() });

export const ProjectSchema = z
  .object({
    slug: Id,
    title: z.string(),
    kind: z.string(),
    status: z.enum(['shipped', 'building']),
    tagline: z.string(),
    summary: z.string(),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    stack: z.array(z.string()),
    highlights: z.array(z.string()),
    flowHeading: z.string(),
    illustration: IllustrationSchema,
    inspector: InspectorSchema.optional(),
    scenarios: z.array(ScenarioSchema).optional(),
    decisions: z.array(DecisionSchema),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).optional(),
  })
  .superRefine((p, ctx) => {
    const ids = new Set(
      p.illustration.kind === 'graph'
        ? p.illustration.nodes.map((n) => n.id)
        : p.illustration.actors.map((a) => a.id),
    );
    const tables = new Set(p.inspector?.tables.map((t) => t.id) ?? []);
    const check = (steps: z.infer<typeof StepSchema>[], where: string) =>
      steps.forEach((s, i) => {
        if (!ids.has(s.from) || !ids.has(s.to))
          ctx.addIssue({ code: 'custom', message: `${p.slug} ${where} step ${i}: unknown node/actor` });
        if (p.illustration.kind === 'graph' && s.from === s.to)
          ctx.addIssue({ code: 'custom', message: `${p.slug} ${where} step ${i}: graph steps need from != to` });
        s.ops?.forEach((o) => {
          if (!tables.has(o.table))
            ctx.addIssue({ code: 'custom', message: `${p.slug} ${where} step ${i}: unknown table ${o.table}` });
        });
      });
    check(p.illustration.steps, 'main');
    p.scenarios?.forEach((sc) => check(sc.steps, `scenario ${sc.id}`));
  });

export type Op = z.infer<typeof OpSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Illustration = z.infer<typeof IllustrationSchema>;
export type GraphIllustrationT = Extract<Illustration, { kind: 'graph' }>;
export type SequenceIllustrationT = Extract<Illustration, { kind: 'sequence' }>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectInput = z.input<typeof ProjectSchema>;
