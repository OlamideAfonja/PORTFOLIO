import type { ProjectInput } from '../schema';

export const fintech: ProjectInput = {
  slug: 'fintech-ledger',
  title: 'Fintech Microservices',
  kind: 'Architecture exploration',
  status: 'building',
  tagline: 'Moving money safely across services: outbox, sagas, idempotency, a double-entry ledger.',
  summary:
    'A payments backend built to work through the hard parts of distributed money movement rather than the happy path. Every service boundary is a place where a message can be lost, repeated or reordered, so each one has a pattern guarding it.',
  accent: '#7cf5c4',
  stack: ['Node.js', 'TypeScript', 'Postgres', 'RabbitMQ'],
  highlights: ['Outbox pattern', 'Choreography-based sagas', 'Idempotency keys', 'Double-entry ledger'],
  flowHeading: 'Follow one transfer end to end',
  illustration: {
    kind: 'graph',
    viewBox: [1000, 540],
    nodes: [
      { id: 'client', label: 'Client', x: 90, y: 270 },
      { id: 'api', label: 'API', sub: 'transfers', x: 300, y: 270 },
      { id: 'pg', label: 'Postgres', sub: 'state + outbox', x: 500, y: 110 },
      { id: 'relay', label: 'Outbox relay', x: 500, y: 430 },
      { id: 'mq', label: 'RabbitMQ', x: 710, y: 270 },
      { id: 'ledger', label: 'Ledger service', x: 900, y: 150 },
      { id: 'ldb', label: 'Ledger DB', sub: 'double-entry', x: 900, y: 430 },
    ],
    steps: [
      {
        from: 'client',
        to: 'api',
        label: 'POST /transfers',
        caption:
          'The request arrives with an Idempotency-Key. The API records the key before doing any work, so a retry can never start a second transfer.',
        payload: 'POST /transfers\nIdempotency-Key: 7f3a-91c2\n{ "from": "A-1001", "to": "A-2002", "amount": 5000 }',
        ops: [
          { op: 'insert', table: 'keys', key: 'k1', row: { key: '7f3a-91c2', status: 'processing' } },
        ],
      },
      {
        from: 'api',
        to: 'pg',
        label: 'one transaction',
        caption:
          'The transfer row and the outbox row commit in the same Postgres transaction. There is no separate publish to the broker, so a state change cannot exist without its event.',
        payload: 'BEGIN;\n  INSERT INTO transfers ...;\n  INSERT INTO outbox (event) ...;\n  UPDATE idempotency_keys SET status = \'completed\';\nCOMMIT;',
        ops: [
          { op: 'insert', table: 'transfers', key: 't1', row: { id: 't1', amount: '5,000', status: 'PENDING' } },
          { op: 'insert', table: 'outbox', key: 'o1', row: { id: 'o1', event: 'transfer.created', published: 'false' } },
          { op: 'update', table: 'keys', key: 'k1', set: { status: 'completed' } },
        ],
      },
      {
        from: 'pg',
        to: 'relay',
        label: 'poll outbox',
        caption:
          'A relay reads unpublished outbox rows in insertion order. Because it can crash at any point, delivery is at-least-once, and every consumer must be idempotent.',
        payload: 'SELECT * FROM outbox\nWHERE published = false\nORDER BY id\nFOR UPDATE SKIP LOCKED;',
      },
      {
        from: 'relay',
        to: 'mq',
        label: 'transfer.created',
        caption:
          'The relay publishes the event to RabbitMQ, then marks the row as published. Services react to events instead of being driven by a central coordinator.',
        payload: '{ "type": "transfer.created", "id": "t1", "amount": 5000 }',
        ops: [{ op: 'update', table: 'outbox', key: 'o1', set: { published: 'true' } }],
      },
      {
        from: 'mq',
        to: 'ledger',
        label: 'deliver',
        caption:
          'The ledger service consumes the event. It first checks whether this transfer id was already processed, so a redelivery is harmless.',
      },
      {
        from: 'ledger',
        to: 'ldb',
        label: 'debit + credit',
        caption:
          'Two balanced entries are written in one transaction: one debit, one credit, same amount. The books always net to zero, so they can be audited.',
        payload: 'INSERT INTO entries (account, debit, credit) VALUES\n  (\'A-1001\', 5000, 0),\n  (\'A-2002\', 0, 5000);',
        ops: [
          { op: 'insert', table: 'entries', key: 'e1', row: { account: 'A-1001', debit: '5,000', credit: '—' } },
          { op: 'insert', table: 'entries', key: 'e2', row: { account: 'A-2002', debit: '—', credit: '5,000' } },
        ],
      },
    ],
  },
  inspector: {
    tables: [
      { id: 'keys', title: 'idempotency_keys', columns: ['key', 'status'] },
      { id: 'transfers', title: 'transfers', columns: ['id', 'amount', 'status'] },
      { id: 'outbox', title: 'outbox', columns: ['id', 'event', 'published'] },
      { id: 'entries', title: 'ledger entries', columns: ['account', 'debit', 'credit'] },
    ],
  },
  scenarios: [
    {
      id: 'retry',
      title: 'The client retries',
      blurb: 'A timeout makes the client send the same request again.',
      steps: [
        {
          from: 'client',
          to: 'api',
          label: 'POST /transfers',
          caption: 'The first response never arrived, so the client retries with the same Idempotency-Key.',
          payload: 'Idempotency-Key: 7f3a-91c2',
        },
        {
          from: 'api',
          to: 'client',
          label: '200 (replayed)',
          caption:
            'The key is already completed, so the stored response is returned. No second transfer row, no second event, no second debit.',
          outcome: 'blocked',
        },
      ],
    },
    {
      id: 'duplicate',
      title: 'The event is delivered twice',
      blurb: 'The relay crashes after publishing but before marking the row.',
      steps: [
        {
          from: 'relay',
          to: 'mq',
          label: 'publish (again)',
          caption:
            'On restart the relay sees o1 as unpublished and publishes it again. At-least-once delivery means duplicates are expected.',
        },
        {
          from: 'mq',
          to: 'ledger',
          label: 'deliver (duplicate)',
          caption: 'RabbitMQ delivers the same event to the ledger service a second time.',
        },
        {
          from: 'ledger',
          to: 'ldb',
          label: 'already processed',
          caption:
            'The consumer finds the transfer id already recorded and drops the message. The ledger still has exactly two entries.',
          outcome: 'blocked',
        },
      ],
    },
  ],
  decisions: [
    {
      title: 'Outbox over a direct publish',
      why: 'Writing to Postgres and then publishing to the broker can fail between the two calls. The outbox puts the event in the same transaction as the state change.',
      cost: 'A relay process to run and monitor, and a small publish delay from polling.',
    },
    {
      title: 'Idempotency keys at the edge',
      why: 'Clients retry on timeouts and flaky networks. A stored key turns a retry into a replay.',
      cost: 'A key table, a retention policy, and a decision on what to do with in-flight keys.',
    },
    {
      title: 'Choreography over orchestration',
      why: 'Services react to events, so no central coordinator has to scale or stay up for a saga to finish.',
      cost: 'The saga is spread across services and is harder to see end to end.',
    },
    {
      title: 'A double-entry ledger',
      why: 'Every movement writes balanced entries, so the system can prove its own totals.',
      cost: 'Two writes per movement and strict invariants around them.',
    },
  ],
};
