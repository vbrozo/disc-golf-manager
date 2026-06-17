# Disc Golf Manager

Browser-based Disc Golf management simulator. Frontend-only, no backend.

## Stack

- Next.js (App Router) + TypeScript
- Zustand (state) + localStorage (persistence)
- Tailwind CSS
- Vitest (tests)

## Quick Start

```bash
npm install
npm run dev
npm test
npm run build
```

## Docs

- [`CLAUDE_CONTEXT.md`](./CLAUDE_CONTEXT.md) — architecture rules + system map (AI context)
- [`docs/PROJECT_STATE.md`](./docs/PROJECT_STATE.md) — current implementation status
- [`docs/GAME_DESIGN.md`](./docs/GAME_DESIGN.md) — game design document
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — planned features

## Deployment

Vercel (no backend required). `npm run build` must pass before deploy.
