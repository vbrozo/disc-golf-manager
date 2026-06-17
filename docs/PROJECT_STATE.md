# Project State

Current implementation status. Update this file when systems change.

## Infrastructure

| Item | Status |
|------|--------|
| Next.js App Router scaffold | ✅ |
| TypeScript strict mode | ✅ |
| Tailwind CSS | ✅ |
| Zustand store + persist | ✅ |
| SSR-safe localStorage (skipHydration + GameClient.tsx) | ✅ |
| Vitest unit tests | ✅ |
| Vercel-ready build (npm run build passes) | ✅ |
| Mobile-optimised layout (≥2.75rem tap targets, 16px inputs) | ✅ |

## Game Engine (`game/`)

### Simulation (`game/simulation/`)
- `holeSimulator.ts` — per-hole score with fatigue, terrain, stat weights
- `roundSimulator.ts` — aggregates holes into a round
- `tournamentSimulator.ts` — runs a full field (club players + NPCs)
- Stat weights: Driving 30% / Accuracy 40% / Putting 20% / Mental 10%
- Fatigue: grows with hole index, reduced by Stamina; 18-hole events punish more than 9-hole

### Tournament System (`game/tournaments.ts`)
- 10 tournaments, difficulty 1–5, prize pools, reputation gates
- Scaled from beginner (rep 0) to elite (rep 275)
- `getAvailableTournaments`, `calculateRewards`, `getTournamentById`

### Economy (`game/economy.ts`)
- Entry fee = 5% of prize pool × difficulty scalar
- `checkEntryEligibility` — reputation gate, then funds check
- `buildSettlement`, `settleClubEconomy`

### Training (`game/training.ts`)
- 5 types: Driving, Accuracy, Putting, Mental, Fitness (trains Stamina)
- `TRAINING_PROGRAMS` catalogue with costs
- Each session: costs money, gives +1 to +5 stat boost (capped at 100)

### Disc System (`game/discs.ts`)
- 3 types × 4 rarities = 12 discs catalogue
- Common +2 / Rare +4 / Pro +6 / Signature +9 bonus
- Max 1 disc per type per player
- `effectivePlayerStats(player)` used inside tournament simulation

### Season Loop (`game/season.ts`)
- `SeasonState`: season #, current round, rounds-per-season (default 5), phase
- Phase machine: `preseason → select → training → (select…) → complete`
- `startSeason`, `recordRoundResult`, `advanceRound`, `isSeasonComplete`, `summariseSeason`
- New game: `STARTING_MONEY` = 2000, 3-player starter roster

### Rating (`game/rating.ts`)
- PDGA-style: par = 950 (`BASE_RATING`), ±10/stroke (`RATING_PER_STROKE`) on 18-hole basis
- Clamped 600–1100; 9-hole rounds normalised to 18
- Rolling average of last 8 rounds (`RATING_ROUNDS_WINDOW`)

### Achievements (`game/achievements.ts`)
- Pure functions over club tournament history
- Top-3 finish tracking, streak detection

### Courses (`game/courses.ts`)
- 18-hole course catalogue with terrain attributes (OB risk, wooded, elevation)
- Hole difficulty scaled to match player stat range (~45–70)

### NPC Roster (`game/npcRoster.ts`)
- 100 NPCs, 5 skill tiers × 20, Croatian names
- Generated at new game start, persist through save, accumulate ratings

### Opponents (`game/opponents.ts`)
- Per-tournament field generation (default 8 opponents)
- Random Croatian names + stats

## Store (`store/gameStore.ts`)

Single Zustand store. Key state: `club`, `players`, `tournaments`, `inventory`, `season`,
`language`, `flowStage`, `lastTournament`, `npcRoster`.

All engine calls go through store actions. UI never calls engine directly.

## UI Components (`components/`)

| Component | Purpose |
|-----------|---------|
| `GameClient.tsx` | Client-only rehydration wrapper |
| `GameFlow.tsx` | Main game flow (intro → shop → training → tournament → results) |
| `StartScreen.tsx` | New Game button on first load |
| `NewGameModal.tsx` | Club name + language setup |
| `FlowStepper.tsx` | Discs → Training → Tournament progress indicator |
| `StatusHeader.tsx` | Money / reputation / season / round HUD |
| `LanguageSwitcher.tsx` | EN / HR toggle (fixed top-right) |
| `ResetButton.tsx` | Hard reset (clears save + reloads) |
| `RankingList.tsx` | Global NPC + club player leaderboard |
| `HolePlayback.tsx` | Hole-by-hole animation during tournament |
| `AchievementBadges.tsx` | Achievement display |
| `Avatar.tsx` | Player avatar |
| `Confetti.tsx` | Win celebration effect |
| `FloatingNumbers.tsx` | Animated +money / +rep popups |
| `StatBar.tsx` | Stat progress bar |
| `Header.tsx` | App header |
| `Icon.tsx` | Icon wrapper |

## i18n (`i18n/`)

`t(language, key, params?)` — EN + HR, `{placeholder}` interpolation, falls back to EN then raw key.

## Tests (`tests/`)

12 test files covering: economy, discs, season, training, i18n, store, opponents, rating,
achievements, holeSimulator, roundSimulator, tournamentSimulator.

Run: `npm test`

## Known Gaps vs Old README

- `game/simulation.ts` no longer exists — split into `game/simulation/` subdirectory
- `components/SeasonLoop.tsx` no longer exists — replaced by `components/GameFlow.tsx`
- Test count (43) in old README is outdated
