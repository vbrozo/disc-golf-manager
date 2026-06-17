# Roadmap

## Implemented (main)

- ✅ Season loop (shop → training → tournament → results × 5 rounds)
- ✅ 7-stat player model with disc loadout bonuses
- ✅ PDGA propagator-based round rating calibration
- ✅ Persistent 100-NPC roster with cumulative ratings
- ✅ Stat tooltips in player overview
- ✅ Injury system (model + simulation penalty + UI in PlayerModal)
- ✅ Rating trend chart per player (tournament history)
- ✅ Stat progression charts per player (season history)
- ✅ Club history display (per-season table + earnings/reputation charts)
- ✅ Mobile bottom navigation (5-tab fixed bar, ≤640px)
- ✅ Club facility upgrades (4 upgrades × 2 levels)
- ✅ Achievement badges + win streak chip

---

## v0.3 — Injuries as Game Events

Currently injuries exist in the model and affect simulation, but there's no way to *get*
injured in-game. The natural next step is wiring them to tournament outcomes.

- Chance of injury during tournament simulation (based on fitness, fatigue, field difficulty)
- Injury severity determines `weeksRemaining` (1–4)
- Post-tournament notice: "Player X injured — out for N rounds"
- Medical Team upgrade already reduces recovery time — this makes it meaningful

## v0.4 — Scouting & Recruitment

- Scout pool of free-agent players generated each season
- Hidden potential stats revealed by spending money to scout
- Signing costs money + reputation; club size cap (e.g., max 6 players)
- Old players can be released to make room

## v0.5 — Player Progression & Aging

- Players gain XP from tournaments (stat used = XP for that stat)
- Organic stat growth alongside manual training
- Age field on Player; peak ~28–32, decline from ~35
- Retirement at 45 or when stats fall below threshold
- Youth academy: spend money to get a low-stat young player each season

## v0.6 — Rival Clubs

- 3–5 AI rival clubs with named rosters, budgets, reputations
- They compete in the same tournament pool — you can see them on the leaderboard
- Rivalry meter: beating a rival club boosts morale; losing hurts it
- "Club of the Year" award at season end based on total earnings

## v0.7 — Richer Tournament Variety

- Weather modifiers per round: wind (−accuracy), rain (−putting), heat (−fitness)
- Special event types: Invitational (invite-only, reputation gate), National Championship (season finale)
- Course-specific stat weights (wooded courses favour accuracy, open courses favour power)
- Per-hole risk/reward: optional high-risk lines with eagle upside

---

## Backlog (unscheduled / ideas)

**Economy depth**
- Sponsor contracts: passive income in exchange for performance goals
- Disc degradation: discs wear out over N uses, need replacing
- Prize pool inflation across seasons (harder to keep up without upgrading)
- Equipment loans / buy on credit — risk higher debt for early disc access

**UI / UX**
- Dark/light theme toggle
- Condensed player card view for large rosters (>4 players)
- Drag-and-drop disc equip interface
- Animated reputation bar fill in StatusHeader
- Hole-by-hole animated results playback (more dramatic tournament reveal)
- Per-season leaderboard history — compare reputation & earnings across seasons

**Game feel**
- Sound effects (toggle on/off): birdie chime, win fanfare
- Camera shake on double bogey during hole playback
- Season-end trophy room (list of trophies won, MVP of the season)

**Meta / Progression**
- Prestige system: reset with a bonus (cosmetic club badge, small stat head-start)
- Hard mode: no saving mid-season, permadeath for injuries
- Weekly challenges: "win a tournament with only Common discs" etc.
- Player morale / hot-streak system — random form events that force decisions (rest vs. play)

**Technical**
- Server-side save backup (optional, needs auth)
- Shareable season summary card (og:image generation)
- PWA manifest for install-to-homescreen
- Export/share season result as image or link
