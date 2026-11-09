# Portfolio v2

Next.js 16 (App Router, static export) + React 19 + TypeScript + Anime.js v4.

```powershell
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Architecture

- `src/content`     typed, Zod-validated data: projects (one file each) and site copy
- `src/engine`      framework-free: illustration scenes, inspector reducer, motion, pointer bus, transition
- `src/ui`          React layer: landing sections, case-study sections, providers

A scene is a pure `paint(time)` function over an SVG. Anime.js supplies the clock
(loop, play, or scroll scrub). Add a project: add one file in `src/content/projects/`
and register it in `src/content/projects/index.ts`.

All flow captions, payloads and table rows are representative of the patterns each
project implements. Edit them in `src/content/projects/*.ts` to match your real code.

## Deploy to Vercel

1. Push this folder to a GitHub repository (the `node_modules`, `.next` and `out` folders are git-ignored).
2. In Vercel: Add New > Project > import the repo. Framework preset is detected as Next.js.
   Leave Build Command, Output Directory and Install Command at their defaults.
3. Deploy. Every push to the main branch redeploys; other branches get preview URLs.

Notes
- The site is fully static (pages are prerendered, including the four case studies), so it is served from Vercel's CDN.
- `package-lock.json` is committed so Vercel installs the exact versions tested here. Node must be 20.9 or newer.
- Security headers and `poweredByHeader: false` are set in `next.config.mjs`.
- Production builds are minified automatically. `npm run dev` is not, so its network sizes are much larger than production.
