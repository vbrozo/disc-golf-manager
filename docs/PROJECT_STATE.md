# Project State

Current implementation status. Update this file when systems change.

## Infrastructure

| Item | Status |
|------|--------|
| Next.js App Router scaffold | ✅ |
| TypeScript strict mode | ✅ |
| Plain CSS in `app/globals.css` | ✅ |
| Zustand store + persist | ✅ |
| SSR-safe localStorage (`skipHydration` + `StoreHydrator.tsx`) | ✅ |
| Vitest unit tests (75 tests, 12 files) | ✅ |
| Vercel-ready build (`npm run build` passes) | ✅ |
| Mobile-optimised (≥2.75rem tap targets, 16px inputs, overflow-x hidden) | ✅ |
| Mobile bottom navigation (fixed bar ≤640px) | ✅ |

## Game Engine (`game/`)

### Simulation (`game/simulation/`)
- `holeSimulator.ts` — per-hole score: stat weights, fatigue, terrain, injury penalty, random
- `roundSimulator.ts` — aggregates holes into a round
- `tournamentSimulator.ts` — runs a full field (club players + NPCs)
- Stat weights: power 20% / accuracy 30% / putting 25% / scramble 10% / consistency 10% / mental 5%
- Fatigue: accumulates per hole, reduced by `fitness`
- Injury penalty: −5 performance per active injury

### Tournament System (`game/tournaments.ts`)
- 10 tournaments, difficulty 1–5, prize pools, reputation gates (0–275)
- `getAvailableTournaments`, `getTournamentById`

### Economy (`game/economy.ts`)
- Entry fee = 5% of prize pool × difficulty scalar
- `checkEntryEligibility` — reputation gate, then funds check
- `buildSettlement`, `settleClubEconomy`
- Club Sponsor upgrade discount applied in store (not in economy module)

### Training (`game/training.ts`)
- 7 types: Power, Accuracy, Putting, Scramble, Consistency, Mental, Fitness
- `TRAINING_PROGRAMS` catalogue with costs (300–500)
- Session: costs money (Training Center discount applied in store), gives +1 to +5 stat boost
- Video Analysis upgrade adds extra boost on top in store

### Disc System (`game/discs.ts`)
- 3 types × 4 rarities = 12 discs in catalogue
- Common +2 / Rare +4 / Pro +6 / Signature +9 bonus
- Reputation unlock gates: 0 / 10 / 30 / 75
- Max 1 disc per type per player
- `effectivePlayer(player)` used inside tournament simulation

### Season Loop (`game/season.ts`)
- `SeasonState`: season #, current round, rounds-per-season (default 5), phase, results
- Phase machine: `preseason → select → training → (select…) → complete`
- `startSeason`, `recordRoundResult`, `advanceRound`, `isSeasonComplete`, `summariseSeason`
- Starting money: 2000; 3-player starter roster

### Rating (`game/rating.ts`)
- PDGA propagator-based: per round, all players serve as propagators for cross-calibration
- Par = 950 (`BASE_RATING`), ±10/stroke (`RATING_PER_STROKE`) on 18-hole basis
- Clamped 600–1100; 9-hole rounds normalised
- Rolling average of last 8 rounds (`RATING_ROUNDS_WINDOW`)

### Achievements (`game/achievements.ts`)
- `getAchievements(club, tournaments)` — first win, 3 played, 100 rep
- `getCurrentStreak(tournaments)` — consecutive top-3 finishes
- Shown in `AchievementBadges.tsx` below `StatusHeader`

### Injuries (store + model)
- `Player.injuries: { id, description, weeksRemaining }[]`
- Each active injury = −5 performance in hole simulation
- Heal 1 week per `advanceSeason()` call (+ Medical Team bonus)
- UI: shown in `PlayerModal.tsx` with red chip badges

### Club Upgrades (`game/upgrades.ts`)
- 4 upgrades × 2 levels; `clubUpgrades: Record<string, number>` in store
- `purchaseUpgrade(id)` charges money, increments level
- Effects: `trainingCostMultiplier`, `trainingBoostBonus`, `injuryRecoveryBonus`, `entryFeeMultiplier`

### Courses (`game/courses.ts`)
- 18-hole course catalogue; terrain attributes (OB risk, wooded, elevation)

### NPC Roster (`game/npcRoster.ts`)
- 100 NPCs, 5 skill tiers × 20, Croatian names
- Generated at new game start, persist through save, accumulate ratings

### Opponents (`game/opponents.ts`)
- Per-tournament field sampling from persistent NPC roster
- Falls back to `generateOpponents` if roster not yet seeded

## Store (`store/gameStore.ts`)

Single Zustand store. Key state:

```
club, players, tournaments, inventory, season, language, flowStage,
lastTournament, npcRoster, clubHistory, clubUpgrades
```

Exported interfaces: `SeasonSnapshot`, `EnterTournamentResult`, `TournamentSummary`,
`LeaderboardRow`, `HoleByHoleEntry`, `PlayerHoleTrack`, `FlowStage`, `GameState`

All engine calls go through store actions. UI never calls engine directly.

## UI Components (`components/`)

| Component | Purpose |
|-----------|---------|
| `GameClient.tsx` / `StoreHydrator.tsx` | Client-only rehydration |
| `GameFlow.tsx` | Main game flow router; owns overlay state (rankings/history/upgrades) |
| `StartScreen.tsx` | New Game button on first load |
| `NewGameModal.tsx` | Club name + language + player names setup |
| `FlowStepper.tsx` | Discs → Training → Tournament progress indicator |
| `StatusHeader.tsx` | HUD: money (animated) / rep / season / round / streak; Rankings + History buttons |
| `BottomNav.tsx` | Mobile-only fixed bottom nav (≤640px); 5 tabs |
| `LanguageSwitcher.tsx` | EN / HR toggle |
| `ResetButton.tsx` | Hard reset (clears save + reloads) |
| `RankingList.tsx` | Global NPC + club player leaderboard by rating |
| `ClubHistoryModal.tsx` | Per-season stats table + earnings/reputation SVG line charts |
| `ClubUpgradesModal.tsx` | 4 facility upgrade cards; shows current level and effects |
| `PlayerModal.tsx` | Full player sheet: stats + tooltips, injuries, rating trend, season charts |
| `HolePlayback.tsx` | Hole-by-hole animation after tournament |
| `AchievementBadges.tsx` | Unlocked achievement badges (below StatusHeader) |
| `StatBar.tsx` | Stat progress bar with optional `?` tooltip badge |
| `StatChart.tsx` | SVG line chart for stat/rating progression |
| `Avatar.tsx` | Emoji-based player/disc avatar |
| `Confetti.tsx` | Win celebration |
| `FloatingNumbers.tsx` | Animated +money / +rep popups anchored to host element |
| `Icon.tsx` | Stroke-style SVG icons (exports `IconName` type) |

## i18n (`i18n/`)

Flat dict, `t(language, key, params?)` — EN + HR, `{placeholder}` interpolation.  
Keys: `stat.*`, `stat.*.tooltip`, `injury.*`, `history.*`, `upgrades.*`, `nav.*`, etc.

## Tests (`tests/`)

75 tests across 12 files:
`economy`, `discs`, `season`, `training`, `i18n`, `store`, `opponents`,
`achievements`, `holeSimulator`, `roundSimulator`, `tournamentSimulator`, `rating`

Run: `npm test`

## Known / Intentional Limitations

- Injuries are defined in the model and affect simulation, but have no UI to inflict them
  (they would need to be triggered by game events — e.g., during tournament simulation)
- No per-course stat weights (all courses use same simulation formula)
- Training programs don't have diminishing returns at high stat values
