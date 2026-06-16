# 🥏 Disc Golf Manager

Frontend-only management game (Next.js + Zustand)

---

## 🎯 Project Goal
Build a browser-based Disc Golf management simulator where the player:
- manages a club
- controls players
- enters tournaments
- earns money + reputation
- improves players via training + equipment

---

## 🧠 Architecture Rules
- Next.js (App Router)
- TypeScript
- Zustand for state management
- localStorage for persistence (later phase)
- NO backend
- NO external APIs

---

## 🧩 Game Systems Status

### Project Setup
- Next.js (App Router) scaffold + folders + layout: ✅ done

### Core State
- Zustand store: ✅ done (club, players, tournaments, inventory)
  - actions: setClub, addMoney, updatePlayer, addTournamentResult

### Simulation Engine
- tournament simulation: ✅ done
  - pure TypeScript engine in `game/simulation.ts` (no React, no Zustand)
  - functions: simulateHole, simulateRound, simulateTournament
  - stat weights: Driving 30% / Accuracy 40% / Putting 20% / Mental 10% + random factor
  - hole outcomes: eagle, birdie, par, bogey

### Tournament System
- 10 tournaments: ✅ done
  - static catalogue in `game/tournaments.ts` (no React, no Zustand)
  - 10 tournaments, each: name, holes (9/18), difficulty (1–5), prizePool, reputationRequired
  - scaled from beginner (rep 0) to elite (rep 275)
  - functions: getAvailableTournaments(reputation), calculateRewards(position, tournament), getTournamentById(id)

### Training System
- player training: ✅ done
  - pure TypeScript engine in `game/training.ts` (no React, no Zustand)
  - 5 training types: Driving, Accuracy, Putting, Mental, Fitness (Fitness trains Stamina)
  - static `TRAINING_PROGRAMS` catalogue: each program has type, name, target stat, cost
  - each session costs money and gives a +1 to +5 stat boost (capped at 100)
  - functions: getTrainingProgram(type), rollTrainingBoost(rng), applyTraining(player, type, options)
  - store action: trainPlayer(id, type, options?) — charges club money, applies boost, returns TrainingResult (or null if unaffordable)

### Disc System
- equipment + bonuses: ✅ done
  - pure TypeScript engine in `game/discs.ts` (no React, no Zustand)
  - 3 disc types → stats: Driver → Driving, Midrange → Accuracy, Putter → Putting
  - 4 rarity tiers with scaling bonus: Common +2 / Rare +4 / Pro +6 / Signature +9
  - static `DISCS` catalogue: one disc per type per rarity (12 total)
  - equip rule enforced: max 1 disc per type (equipping replaces that type's slot)
  - functions: getDiscById(id), bonusForRarity(rarity), createDisc(...), equipDisc(loadout, disc), unequipDisc(loadout, type), getLoadoutBonuses(loadout), applyDiscBonuses(stats, loadout), effectivePlayerStats(player)
  - store actions: addDisc(disc), equipDisc(playerId, discId), unequipDisc(playerId, type) — player loadout stored on `Player.equipped`

### Economy System
- money + rewards: ✅ done
  - pure TypeScript engine in `game/economy.ts` (no React, no Zustand)
  - entry fees: derived from prize pool (`ENTRY_FEE_RATE` 5%) and scaled by difficulty — `getEntryFee(tournament)`
  - reputation unlock logic: `meetsReputationRequirement`, `getLockedTournaments`, `getNextUnlock`, `reputationToUnlock`
  - entry eligibility: `checkEntryEligibility(club, tournament)` — reputation gate first, then entry-fee affordability (reason: `locked` | `insufficient-funds`)
  - rewards system: `buildSettlement(tournament, earnings, reputationGained)` → net money (earnings − entry fee) + reputation
  - money gain from tournaments: `settleClubEconomy(club, settlement)` — credits net prize money (floored at 0) and reputation
  - store action: `enterTournament(id, options?)` — charges entry fee, simulates with the roster, settles prize money + reputation from the best finisher, records the result; returns `EnterTournamentResult` (or null if unknown/locked/unaffordable/no players)

### Game Loop
- full season loop: ✅ done
  - pure TypeScript engine in `game/season.ts` (no React, no Zustand)
  - ties every system into one repeatable loop:
    `start season → select tournament → simulate → earn rewards → training → repeat`
  - `SeasonState` tracks season #, current round, rounds-per-season (default 5), phase + per-round results
  - phase state machine: `preseason → select → training → (select…) → complete`
  - functions: `startSeason`, `recordRoundResult`, `advanceRound`, `isSeasonComplete`, `summariseSeason`, `createStarterRoster`
  - new-game bootstrap: `STARTING_MONEY` (2000) + a 3-player starter roster
  - store state `season` + actions:
    - `startNewGame()` — seed club money + roster, start season 1
    - `playTournamentRound(id, options?)` — simulate + settle + record, then enter training (reuses `enterTournament`)
    - `advanceSeason()` — next round or end the season
    - `startSeason()` — begin the next season, keeping club/roster/progress
  - playable UI: client component `components/SeasonLoop.tsx` drives the loop on the dashboard

---

## 👤 Player Model
Stats (1–100):
- Driving
- Accuracy
- Putting
- Mental
- Stamina

---

## 🥏 Disc System
- Driver → Driving bonus
- Midrange → Accuracy bonus
- Putter → Putting bonus
- Rarity affects bonus strength: Common / Rare / Pro / Signature
- Equip rule: 1 disc per type per player

---

## 🏆 Tournament Structure
- 9 or 18 holes
- difficulty 1–5
- prize pool
- reputation requirement

---

## 💰 Economy Rules
- win money from tournaments
- spend on training + discs
- reputation unlocks better tournaments

---

## 🚀 Deployment
- Target: Vercel
- Framework: Next.js (App Router)
- Build: npm run build
- No backend required
- Must be fully client-side compatible
- Verified Vercel-ready: ✅
  - `npm run build` compiles, type-checks, and statically prerenders `/` (no SSR/runtime errors)
  - no server-only or Node.js-only APIs (`fs`, `path`, `child_process`, `process.env`) used in app code
  - all stateful UI (`Dashboard.tsx`, `SeasonLoop.tsx`) marked `"use client"`; game engine (`game/*`) stays pure TS with no React/Zustand/window/localStorage access
  - no `window`/`localStorage` usage yet, so there are no hydration mismatches to guard against — persistence (see Architecture Rules) will need a client-only effect/guard when added

### Dashboard UI
- overview dashboard: ✅ done
  - client component `components/Dashboard.tsx` (UI only, reads from the Zustand store)
  - 5 read-only sections: Club Overview, Players, Tournaments, Training, Inventory
  - rendered above the interactive `SeasonLoop` on the home page
  - minimalist styling added to `app/globals.css` (`.dash-grid` / `.dash-card`), no UI framework

## 📌 Next Task
(not set yet)

All core systems are implemented and wired into the season game loop, with a
read-only dashboard overview on top. Possible follow-ups: localStorage
persistence, a roster/club-creation screen, and a disc shop UI.
