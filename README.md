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
- money + rewards: ❌ not started

### Game Loop
- full season loop: ❌ not started

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

## 📌 Next Task
(not set yet)
