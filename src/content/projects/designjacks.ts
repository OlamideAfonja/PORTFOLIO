import type { ProjectInput } from '../schema';

export const designjacks: ProjectInput = {
  slug: 'designjacks',
  title: 'DesignJacks',
  kind: 'AI UI/UX tool',
  status: 'shipped',
  tagline: 'Describe an interface, get components and a design system, then export the code.',
  summary:
    'An AI-powered design tool that generates UI components and design systems, analyzes existing designs, and exports to code. It is built to be affordable for teams the incumbent tools price out, starting in Nigeria.',
  accent: '#ffb86b',
  stack: ['Next.js', 'TypeScript', 'Tailwind', 'Gemini API', 'Vercel'],
  highlights: ['Component generator', 'Design system generator', 'Design analyzer', 'Code export'],
  flowHeading: 'From a sentence to shippable code',
  illustration: {
    kind: 'graph',
    viewBox: [1000, 520],
    nodes: [
      { id: 'user', label: 'Prompt', x: 90, y: 260 },
      { id: 'app', label: 'DesignJacks', sub: 'Next.js', x: 330, y: 260 },
      { id: 'gemini', label: 'Gemini API', x: 330, y: 90 },
      { id: 'preview', label: 'Live preview', x: 600, y: 260 },
      { id: 'export', label: 'Code export', x: 880, y: 260 },
    ],
    steps: [
      {
        from: 'user',
        to: 'app',
        label: 'describe it',
        caption: 'You describe the component or the design system you want, in plain language.',
        payload: '"A pricing card with three tiers and a highlighted middle plan"',
      },
      {
        from: 'app',
        to: 'gemini',
        label: 'structured prompt',
        caption: 'The app wraps your words in a structured prompt that asks the model for a specific, parseable shape rather than free text.',
      },
      {
        from: 'gemini',
        to: 'app',
        label: 'component spec',
        caption: 'The model returns a spec for the component: structure, styles and tokens, which the app validates before using.',
        payload: '{ "component": "PricingCard", "tiers": 3, "accent": "#ffb86b" }',
      },
      {
        from: 'app',
        to: 'preview',
        label: 'render',
        caption: 'The validated spec is rendered as a live preview, so you can judge and refine it before anything is exported.',
      },
      {
        from: 'preview',
        to: 'export',
        label: 'export',
        caption: 'When it looks right, the component exports as code you can drop into your own project.',
        payload: 'export function PricingCard() { ... }',
      },
    ],
  },
  decisions: [
    {
      title: 'Validate before rendering',
      why: 'Model output is treated as untrusted input. The app checks its shape before anything reaches the preview.',
      cost: 'A schema to maintain as the generator grows new capabilities.',
    },
    {
      title: 'Preview before export',
      why: 'Seeing the result live shortens the loop between an idea and a decision.',
      cost: 'A rendering path that has to stay faithful to the exported code.',
    },
    {
      title: 'Priced for the local market',
      why: 'Design tooling is often priced in dollars that many small teams here cannot justify.',
      cost: 'Thinner margins, so the generation pipeline has to stay cheap per request.',
    },
  ],
  links: [{ label: 'designjacks.com', href: 'https://designjacks.com' }],
};
