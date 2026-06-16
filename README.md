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
- 10 tournaments: ❌ not started

### Training System
- player training: ❌ not started

### Disc System
- equipment + bonuses: ❌ not started

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

## 🥏 Disc System (planned)
- Driver → Driving bonus
- Midrange → Accuracy bonus
- Putter → Putting bonus
- Rarity affects bonus strength

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
