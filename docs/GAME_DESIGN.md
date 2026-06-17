# Game Design Document

## Concept

Browser-based Disc Golf management simulator. The player manages a club — buying discs,
training players, entering tournaments — across repeating seasons. No real-time action;
all outcomes are simulated.

## Player Model

Stats (1–100 each):

| Stat | Role in simulation |
|------|--------------------|
| Driving | Tee shot distance + power (30% weight) |
| Accuracy | Fairway approach (40% weight) |
| Putting | Short game finish (20% weight) |
| Mental | Consistency, pressure handling (10% weight) |
| Stamina | Fatigue resistance — degrades other stats over holes |

Effective stats = base + disc equipment bonuses.

A player's performance rating (PDGA-style) is a rolling average of their last 8 rounds,
calculated from score vs par (base 950, ±10/stroke on 18-hole basis, clamped 600–1100).

## Disc Model

Three disc types, each boosting one stat:

| Type | Boosts |
|------|--------|
| Driver | Driving |
| Midrange | Accuracy |
| Putter | Putting |

Four rarity tiers:

| Rarity | Bonus |
|--------|-------|
| Common | +2 |
| Rare | +4 |
| Pro | +6 |
| Signature | +9 |

Rule: max 1 disc per type per player. Equipping replaces the existing slot.
Price scales with rarity bonus (×50 per bonus point → Common 100, Signature 450).

## Simulation Engine

Per-hole simulation chain:

1. `effectivePlayerStats(player)` — apply disc bonuses
2. Fatigue penalty = `holeIndex × (1 − Stamina/100)` applied to all stats
3. Weighted performance score: Driving 30% + Accuracy 40% + Putting 20% + Mental 10%
4. Add terrain modifiers (OB risk, wooded, elevation from course data)
5. Add random factor
6. Map performance score to hole outcome: eagle / birdie / par / bogey / double bogey

18-hole tournaments punish low Stamina much more than 9-hole events (fatigue is not
normalised to round length — it accumulates per hole played).

## Economy

- **Entry fees**: 5% of prize pool × difficulty scalar
- **Prize money**: distributed by finish position (`PRIZE_SHARES`)
- **Net earnings**: prize money − entry fee (floored at 0)
- **Reputation**: earned from best finisher's placement; gates access to harder tournaments
- **Starting money**: 2000

Reputation unlock thresholds scale from 0 (beginner) to 275 (elite) across 10 tournaments.

## Tournament Design

| Property | Range |
|----------|-------|
| Holes | 9 or 18 |
| Difficulty | 1–5 |
| Prize pool | Scales with difficulty |
| Rep required | 0–275 |

AI field: 8 opponents per tournament (default), drawn from the 100-NPC persistent roster.
Club players compete against the full field; leaderboard shows all placements.

## Reputation System

- Earned per tournament from best club finisher's placement
- Gates access to higher-tier tournaments (locked until threshold met)
- Shown in the HUD at all times

## Season Progression

One season = 5 rounds (configurable). Each round:

1. Shop (buy/equip discs) — gated: must fully equip all players to proceed
2. Training — choose stat to boost for each player
3. Tournament — simulate, collect prizes + reputation
4. Results — leaderboard + earnings summary

After 5 rounds: season summary, then start next season (club/roster/progress carry over).

## NPC Roster

100 persistent NPCs generated at new game start, 5 skill tiers × 20 players.
They accumulate ratings across seasons and appear on the global ranking list.
Provides a stable competitive landscape the player can track their rise through.

## Future Systems

See [`ROADMAP.md`](./ROADMAP.md).
