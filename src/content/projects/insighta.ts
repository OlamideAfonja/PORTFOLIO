import type { ProjectInput } from '../schema';

export const insighta: ProjectInput = {
  slug: 'insighta',
  title: 'Insighta Labs+',
  kind: 'API + CLI + web portal',
  status: 'shipped',
  tagline: 'One API serving a command-line tool and a web portal, with auth designed in from the start.',
  summary:
    'A multi-interface platform: a single backend that a CLI and a web portal both talk to. Login uses GitHub OAuth with PKCE, sessions are JWT pairs, and every request passes through role-based access control and rate limiting.',
  accent: '#a78bfa',
  stack: ['Node.js', 'TypeScript', 'Postgres', 'Railway'],
  highlights: ['GitHub OAuth + PKCE', 'JWT auth + RBAC', 'API versioning', 'Rate limiting + CSRF protection', 'CSV export'],
  flowHeading: 'Follow one CLI login end to end',
  illustration: {
    kind: 'sequence',
    actors: [
      { id: 'cli', label: 'CLI', sub: 'insighta' },
      { id: 'browser', label: 'Browser' },
      { id: 'gh', label: 'GitHub' },
      { id: 'api', label: 'API', sub: 'JWT · RBAC' },
      { id: 'db', label: 'Postgres' },
    ],
    steps: [
      {
        from: 'cli',
        to: 'cli',
        label: 'verifier + S256 challenge',
        caption:
          'A CLI cannot keep a client secret, so it generates a random verifier and derives a SHA-256 challenge from it. The verifier never leaves the machine.',
        payload: 'challenge = BASE64URL(SHA256(verifier))',
      },
      {
        from: 'cli',
        to: 'browser',
        label: 'open /auth/github',
        caption: 'The CLI opens the browser at the login URL, passing the challenge and a random state value.',
        payload: '/auth/github?code_challenge=E9Me...&state=4c1f...',
      },
      {
        from: 'browser',
        to: 'gh',
        label: 'authorize',
        caption: 'The user signs in on GitHub and approves access. The password is never seen by this system.',
      },
      {
        from: 'gh',
        to: 'api',
        label: 'callback: code + state',
        caption:
          'GitHub redirects back to the API with a code. The API checks that state matches what it issued, which blocks cross-site request forgery.',
        payload: '/auth/github/callback?code=gho_...&state=4c1f...',
      },
      {
        from: 'api',
        to: 'db',
        label: 'upsert user + role',
        caption: 'The API resolves the GitHub identity to a user row and its role. Access control reads that role on every later request.',
        ops: [
          { op: 'insert', table: 'users', key: 'u1', row: { login: 'octocat', role: 'member' } },
          { op: 'insert', table: 'codes', key: 'c1', row: { code: 'a91f...', challenge: 'E9Me...', used: 'false' } },
        ],
      },
      {
        from: 'api',
        to: 'cli',
        label: 'one-time code',
        caption: 'The API hands the CLI a short-lived one-time code through a loopback redirect, bound to the stored challenge.',
        payload: 'http://127.0.0.1:PORT/cb?code=a91f...',
      },
      {
        from: 'cli',
        to: 'api',
        label: 'POST /token',
        caption: 'The CLI exchanges the code and presents the original verifier.',
        payload: '{ "code": "a91f...", "code_verifier": "..." }',
      },
      {
        from: 'api',
        to: 'cli',
        label: 'access + refresh JWT',
        caption:
          'The API verifies that SHA-256 of the verifier equals the stored challenge, burns the code, and issues a token pair. Only the holder of the verifier can complete the login.',
        payload: '{ "access_token": "eyJ...", "refresh_token": "..." }',
        ops: [{ op: 'update', table: 'codes', key: 'c1', set: { used: 'true' } }],
      },
    ],
  },
  inspector: {
    tables: [
      { id: 'users', title: 'users', columns: ['login', 'role'] },
      { id: 'codes', title: 'auth_codes', columns: ['code', 'challenge', 'used'] },
    ],
  },
  scenarios: [
    {
      id: 'csrf',
      title: 'A forged callback',
      blurb: 'An attacker sends the callback with a state value the API never issued.',
      steps: [
        {
          from: 'gh',
          to: 'api',
          label: 'callback: wrong state',
          caption: 'A callback arrives, but its state does not match any pending login.',
        },
        {
          from: 'api',
          to: 'browser',
          label: '400 state mismatch',
          caption: 'The API rejects it before touching the database. No user row, no code, no tokens.',
          outcome: 'blocked',
        },
      ],
    },
    {
      id: 'replay',
      title: 'A replayed code',
      blurb: 'Someone captures the one-time code and tries to use it again.',
      steps: [
        {
          from: 'cli',
          to: 'api',
          label: 'POST /token (used code)',
          caption: 'The same code arrives a second time.',
        },
        {
          from: 'api',
          to: 'cli',
          label: '400 invalid_grant',
          caption: 'The code is already marked used, so the exchange fails. A stolen code is worthless after the first redemption.',
          outcome: 'blocked',
        },
      ],
    },
  ],
  decisions: [
    {
      title: 'PKCE for the CLI',
      why: 'A command-line tool is a public client, so it cannot hold a secret. PKCE binds the code to a verifier only that client knows.',
      cost: 'An extra round trip and a loopback listener on the user machine.',
    },
    {
      title: 'One API for every interface',
      why: 'The CLI and the web portal share authentication, access control and rate limits instead of each growing their own.',
      cost: 'Version discipline: a change for one client can break the other.',
    },
    {
      title: 'Roles enforced at the API',
      why: 'Clients are never trusted to decide what a user may do. Every request is checked against the stored role.',
      cost: 'A database read on the hot path, or a cache to avoid it.',
    },
  ],
};
