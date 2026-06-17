# Disc Golf Manager — AI Context

## Stack

- Next.js 14 (App Router), TypeScript strict mode
- Zustand (`store/gameStore.ts`) with `persist` middleware
- No Tailwind (plain CSS in `app/globals.css`)
- Vitest for unit tests

## Hard Architecture Rules

- **No backend, no external APIs** — pure client-side simulation
- **Engine never imports React or Zustand** — `game/*` and `models/*` are plain TypeScript
- **Engine never touches `window` or `localStorage`** — SSR-safe
- **`store/gameStore.ts`** is the only place that calls engine functions and mutates state
- **All stateful UI components** must be marked `"use client"`
- SSR safety: `skipHydration` in Zustand, rehydration via `components/StoreHydrator.tsx`

## Directory Map

```
app/                    Next.js App Router (layout, page, globals.css)
components/             React UI components (all "use client")
game/                   Pure TS game engine (no React/Zustand)
  simulation/           holeSimulator.ts, roundSimulator.ts, tournamentSimulator.ts
  achievements.ts       Achievement unlock logic + streak detection
  courses.ts            Course + hole catalogue
  discs.ts              Disc catalogue, equip rules, bonus calc
  economy.ts            Entry fees, eligibility, settlement
  index.ts              Re-exports for the engine
  npcRoster.ts          Persistent 100-NPC roster generation
  opponents.ts          Per-tournament opponent generation
  rating.ts             PDGA-style round rating calc (propagator-based)
  season.ts             Season state machine
  tournaments.ts        Tournament catalogue (10 tournaments)
  training.ts           Training programs + boost logic (7 types)
  upgrades.ts           Club facility upgrade definitions + effect helpers
hooks/                  useTranslation, useFloatingNumbers, useAnimatedNumber, useNotice
i18n/                   Flat dictionaries + t() function (EN/HR)
models/                 TypeScript interfaces (Club, Course, Disc, Player, Tournament)
store/                  gameStore.ts — single Zustand store
tests/                  Vitest unit tests (one file per engine module, 75 tests)
types/                  Shared type aliases (index.ts)
utils/                  Pure helpers (avatar.ts, format.ts)
```

## Key Store Actions

| Action | Effect |
|--------|--------|
| `startNewGame(options?)` | Seeds club + 3-player roster, starts season 1, resets upgrades |
| `enterTournament(id)` | Charges discounted fee, simulates field, settles prize + rep |
| `playTournamentRound(id)` | `enterTournament` + records round in season |
| `trainPlayer(id, type)` | Charges discounted cost, applies boosted stat (upgrade-aware) |
| `buyDiscs(discId, qty)` | Charges money, adds copies to inventory |
| `equipDisc(playerId, discId)` | Equips disc (max 1 per type per player) |
| `advanceSeason()` | Next round or ends season; reduces injury weeks (upgrade-aware) |
| `startSeason()` | Begins next season, keeps club/roster/progress/upgrades |
| `purchaseUpgrade(id)` | Charges cost, increments `clubUpgrades[id]` level |

## Persisted State Keys

`club`, `players`, `tournaments`, `inventory`, `season`, `language`, `flowStage`,
`lastTournament`, `npcRoster`, `clubHistory`, `clubUpgrades`

## Player Model (7 stats, all 1–100)

`power`, `accuracy`, `putting`, `scramble`, `consistency`, `mental`, `fitness`

- `rating`: rolling average of last 8 PDGA-style round ratings (600–1100)
- `ratingHistory[]`: up to 8 recent round ratings
- `seasonHistory[]`: snapshot of stats at end of each season
- `tournamentHistory[]`: per-tournament placement + rating trend
- `injuries[]`: `{ id, description, weeksRemaining }` — each active injury = −5 performance
- `equipped`: `{ Driver?, Midrange?, Putter? }` disc loadout

Effective stats = base stats + disc bonuses + injury penalty in simulation.

## Disc System

- 3 types: Driver (→ power), Midrange (→ accuracy), Putter (→ putting)
- 4 rarities: Common +2 / Rare +4 / Pro +6 / Signature +9 bonus
- Reputation gates: Common 0 / Rare 10 / Pro 30 / Signature 75
- Max 1 disc per type per player; equipping replaces existing slot

## Tournament Simulation

`holeSimulator.ts` → `roundSimulator.ts` → `tournamentSimulator.ts`

Stat weights per hole: power 20% / accuracy 30% / putting 25% / scramble 10% / consistency 10% / mental 5%  
Fatigue: grows with hole index × (1 − fitness/100)  
Injury penalty: −5 performance per active injury  
PDGA ratings: propagator-based per-round calibration (`game/rating.ts`)

## Club Upgrades (`game/upgrades.ts`)

4 upgrades × 2 levels each. Effects applied in store actions:

| ID | Effect |
|----|--------|
| `training-center` | −15% / −30% training cost (in `trainPlayer`) |
| `video-analysis` | +1 / +2 stat boost bonus (in `trainPlayer`) |
| `medical-team` | +1 / +2 extra injury weeks recovered per round (in `advanceSeason`) |
| `club-sponsor` | −10% / −20% entry fee (in `enterTournament`) |

## Season Loop (UI flow)

`flowStage`: `intro → shop → training → tournament → results → training → … → complete`

Driven by `components/GameFlow.tsx`. Shop gates progress until all players fully equipped.  
End-of-season snapshot saved to `clubHistory: SeasonSnapshot[]`.

## UI Components (key ones)

| Component | Purpose |
|-----------|---------|
| `GameFlow.tsx` | Main router; owns `showRankings`, `showHistory`, `showUpgrades` state |
| `StatusHeader.tsx` | HUD: money / rep / season / round / streak + Rankings + History buttons |
| `BottomNav.tsx` | Mobile-only fixed bottom bar (≤640px): Shop / Training / Tournament / Rankings / History |
| `ClubHistoryModal.tsx` | Per-season stats + earnings/rep SVG line charts |
| `ClubUpgradesModal.tsx` | 4 facility upgrade cards with level badges + buy buttons |
| `PlayerModal.tsx` | Player stats, injuries, rating trend chart, season progression |
| `RankingList.tsx` | Global NPC + club player leaderboard |
| `HolePlayback.tsx` | Hole-by-hole animation during tournament results |
| `StatBar.tsx` | Stat bar with optional tooltip (? badge + CSS ::after) |
| `StatChart.tsx` | SVG line chart for player stat progression |
| `FloatingNumbers.tsx` | Animated +money / +rep popups |
| `Icon.tsx` | Stroke-style SVG icons; exports `IconName` type |

## i18n

`i18n/index.ts` — `t(language, key, params?)`. Languages: `en` | `hr`.  
Keys follow `module.subkey` pattern. Falls back to EN, then raw key.  
Hook: `hooks/useTranslation.ts`. Language persisted in store.

## Ratings

PDGA propagator-based: each round, all players serve as propagators.  
Par = 950, ±10 points per stroke (18-hole basis). Clamped 600–1100.  
Player `rating` = rolling average of last 8 event ratings.

## Coding Rules

- TypeScript strict mode — no `any`
- Small pure functions in engine, side-effects only in store actions
- Tests required for every engine module change (`tests/<module>.test.ts`)
- No comments unless the WHY is non-obvious; no docstring blocks on obvious code
- `e.stopPropagation()` on buttons inside clickable cards to prevent event bubbling
