import type { ProjectInput } from '../schema';

export const agent: ProjectInput = {
  slug: 'tool-agent',
  title: 'Task-Automation Agent',
  kind: 'Tool-calling agent',
  status: 'building',
  tagline: 'A model that plans, calls tools, reads the results, and loops until the task is done.',
  summary:
    'An agent built in Node.js and TypeScript on the Anthropic API. The loop is plain code: call the model, run whatever tool it asks for, append the result, repeat until the model stops asking.',
  accent: '#6bb8ff',
  stack: ['Node.js', 'TypeScript', 'Anthropic API'],
  highlights: ['Tool-calling loop', 'Growing message history'],
  flowHeading: 'One task, one loop',
  illustration: {
    kind: 'graph',
    viewBox: [1000, 520],
    nodes: [
      { id: 'task', label: 'Task', x: 90, y: 260 },
      { id: 'llm', label: 'Model', sub: 'plans next move', x: 360, y: 260 },
      { id: 'tool', label: 'Tool call', x: 640, y: 110 },
      { id: 'result', label: 'Observation', x: 640, y: 410 },
      { id: 'answer', label: 'Answer', x: 900, y: 260 },
    ],
    steps: [
      {
        from: 'task',
        to: 'llm',
        label: 'user task',
        caption: 'The task enters as the first message. The model sees it along with the list of tools it is allowed to call.',
        payload: '"Summarise today\'s failed payments and send the report"',
        ops: [{ op: 'insert', table: 'messages', key: 'm1', row: { role: 'user', content: 'task' } }],
      },
      {
        from: 'llm',
        to: 'tool',
        label: 'tool_use',
        caption: 'Instead of answering, the model asks for a tool call. The loop pauses the model and hands the request to your code.',
        payload: '{ "type": "tool_use", "name": "query_payments", "input": { "status": "failed" } }',
        ops: [{ op: 'insert', table: 'messages', key: 'm2', row: { role: 'assistant', content: 'tool_use: query_payments' } }],
      },
      {
        from: 'tool',
        to: 'result',
        label: 'execute',
        caption: 'Your code runs the tool for real and captures its output, including errors.',
      },
      {
        from: 'result',
        to: 'llm',
        label: 'tool_result',
        caption: 'The output goes back into the history as a new message. The model now reasons over everything so far, so context grows on every lap.',
        ops: [{ op: 'insert', table: 'messages', key: 'm3', row: { role: 'user', content: 'tool_result: 14 rows' } }],
      },
      {
        from: 'llm',
        to: 'tool',
        label: 'tool_use',
        caption: 'Second lap: with the data in hand, the model asks for a different tool.',
        payload: '{ "type": "tool_use", "name": "send_report", "input": { ... } }',
        ops: [{ op: 'insert', table: 'messages', key: 'm4', row: { role: 'assistant', content: 'tool_use: send_report' } }],
      },
      {
        from: 'tool',
        to: 'result',
        label: 'execute',
        caption: 'The second tool runs and returns its result.',
      },
      {
        from: 'result',
        to: 'llm',
        label: 'tool_result',
        caption: 'Again the result is appended and the model is called with the longer history.',
        ops: [{ op: 'insert', table: 'messages', key: 'm5', row: { role: 'user', content: 'tool_result: sent' } }],
      },
      {
        from: 'llm',
        to: 'answer',
        label: 'end_turn',
        caption: 'This time the model asks for no tool. That signal ends the loop and the final text is the answer.',
        ops: [{ op: 'insert', table: 'messages', key: 'm6', row: { role: 'assistant', content: 'final answer' } }],
      },
    ],
  },
  inspector: {
    tables: [{ id: 'messages', title: 'message history', columns: ['role', 'content'] }],
  },
  decisions: [
    {
      title: 'The loop is plain code',
      why: 'Call the model, run the tool, append the result, repeat. Every step is visible and debuggable.',
      cost: 'Retries, timeouts and error handling are yours to write.',
    },
    {
      title: 'A hard cap on laps',
      why: 'A model that never stops asking for tools would loop forever and spend money doing it.',
      cost: 'Some legitimately long tasks need the cap raised deliberately.',
    },
    {
      title: 'Tool errors go back to the model',
      why: 'A failed tool call is information. Returning the error lets the model recover instead of crashing the run.',
      cost: 'You have to decide which failures are recoverable and which should stop the loop.',
    },
  ],
};
