# Disc Golf Manager — AI Context

## Stack

- Next.js 14 (App Router), TypeScript strict mode
- Zustand (`store/gameStore.ts`) with `persist` middleware
- Tailwind CSS
- Vitest for unit tests

## Hard Architecture Rules

- **No backend, no external APIs** — pure client-side simulation
- **Engine never imports React or Zustand** — `game/*` and `models/*` are plain TypeScript
- **Engine never touches `window` or `localStorage`** — SSR-safe
- **`store/gameStore.ts`** is the only place that calls engine functions and mutates state
- **All stateful UI components** must be marked `"use client"`

## Directory Map

```
app/                    Next.js App Router (layout, page)
components/             React UI components (all "use client")
game/                   Pure TS game engine (no React/Zustand)
  simulation/           holeSimulator.ts, roundSimulator.ts, tournamentSimulator.ts
  achievements.ts       Achievement unlock logic
  courses.ts            Course + hole catalogue
  discs.ts              Disc catalogue, equip rules, bonus calc
  economy.ts            Entry fees, eligibility, settlement
  index.ts              Re-exports for the engine
  npcRoster.ts          Persistent 100-NPC roster generation
  opponents.ts          Per-tournament opponent generation
  rating.ts             PDGA-style round rating calc
  season.ts             Season state machine
  tournaments.ts        Tournament catalogue
  training.ts           Training programs + boost logic
hooks/                  Custom React hooks
i18n/                   Dictionary + t() function (EN/HR)
models/                 TypeScript interfaces (Club, Course, Disc, Player, Tournament)
store/                  gameStore.ts — single Zustand store
tests/                  Vitest unit tests (one file per engine module)
types/                  Shared type aliases (index.ts)
utils/                  Pure helpers (avatar.ts, format.ts)
```

## Key Store Actions

| Action | Effect |
|--------|--------|
| `startNewGame(options?)` | Seeds club money + 3-player roster, starts season 1 |
| `enterTournament(id)` | Charges fee, simulates field, settles prize + reputation |
| `playTournamentRound(id)` | `enterTournament` + records round in season |
| `trainPlayer(id, type)` | Charges money, applies stat boost |
| `buyDiscs(discId, qty)` | Charges money, adds copies to inventory |
| `equipDisc(playerId, discId)` | Equips disc (max 1 per type per player) |
| `advanceSeason()` | Next round or ends season |
| `startSeason()` | Begins next season, keeps club/roster/progress |

## Player Stats (all 1–100)

Driving, Accuracy, Putting, Mental, Stamina

Effective stats = base stats + disc loadout bonuses (`effectivePlayerStats` in `game/discs.ts`)

## Disc System

- 3 types: Driver (→ Driving), Midrange (→ Accuracy), Putter (→ Putting)
- 4 rarities: Common +2 / Rare +4 / Pro +6 / Signature +9
- Max 1 disc per type per player (`Player.equipped`)

## Tournament Simulation

`game/simulation/holeSimulator.ts` → `roundSimulator.ts` → `tournamentSimulator.ts`

Stat weights per hole: Driving 30% / Accuracy 40% / Putting 20% / Mental 10% + fatigue + random.
Fatigue grows with hole index, shrinks with Stamina — 18-hole events punish low Stamina more.

## Season Loop (UI flow)

`flowStage` in store: `intro → shop → training → tournament → results → training → … → complete`

Driven by `components/GameFlow.tsx`. Shop gates progress until all players are fully equipped.

## Persistence

Zustand `persist` key `disc-golf-manager`. `skipHydration` + client-only rehydrate in
`components/GameClient.tsx` (SSR-safe, no hydration mismatch).

## i18n

`i18n/index.ts` — `t(language, key, params?)`. Languages: `en` | `hr`.
Hook: `hooks/useTranslation.ts`. Language persisted in store.

## Ratings

PDGA-style: `calculateRoundRating(score, holes)` — par = 950, ±10/stroke on 18-hole basis.
Clamped 600–1100. Player's `rating` = rolling average of last 8 rounds.

## NPC Roster

100 NPCs generated at new game start (`game/npcRoster.ts`, 5 skill tiers × 20).
Persist through save, accumulate ratings. Shown on `components/RankingList.tsx`.

## Coding Rules

- TypeScript strict mode — no `any`
- Small pure functions in engine, side-effects only in store actions
- Tests required for every engine module change (`tests/<module>.test.ts`)
- No comments unless the WHY is non-obvious
