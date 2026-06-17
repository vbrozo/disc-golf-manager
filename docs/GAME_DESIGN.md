# Game Design Document

## Concept

Browser-based Disc Golf management simulator. The player manages a club — buying discs,
training players, building facilities, entering tournaments — across repeating seasons.
No real-time action; all outcomes are simulated.

## Player Model

Seven stats (1–100 each):

| Stat | Role in simulation | Weight |
|------|--------------------|--------|
| Power | Drive distance + tee shot power | 20% |
| Accuracy | Fairway approach + disc placement | 30% |
| Putting | Short game finish | 25% |
| Scramble | Recovery from bad lies | 10% |
| Consistency | Reduces variance under pressure | 10% |
| Mental | Composure in critical moments | 5% |
| Fitness | Fatigue resistance across holes | — (passive) |

Effective stats = base stats + disc equipment bonuses.  
Injury penalty: −5 performance per active injury (stacks).

A player's rating (PDGA-style) is a rolling average of their last 8 event ratings,
calibrated using per-round propagator scoring (par = 950, ±10/stroke, clamped 600–1100).

### Player Records

- `ratingHistory[]` — up to 8 recent round ratings (rolling window)
- `seasonHistory[]` — stat snapshot at end of each season (drives progression charts)
- `tournamentHistory[]` — per-tournament placement + rating (drives rating trend chart)
- `injuries[]` — active injuries: `{ id, description, weeksRemaining }`

## Disc Model

Three disc types, each boosting one stat:

| Type | Boosts |
|------|--------|
| Driver | Power |
| Midrange | Accuracy |
| Putter | Putting |

Four rarity tiers:

| Rarity | Bonus | Rep Required |
|--------|-------|-------------|
| Common | +2 | 0 |
| Rare | +4 | 10 |
| Pro | +6 | 30 |
| Signature | +9 | 75 |

Rule: max 1 disc per type per player. Equipping replaces the existing slot.  
Price scales with rarity bonus (×50 per point: Common 100 → Signature 450).

## Simulation Engine

Per-hole simulation chain (`game/simulation/`):

1. `effectivePlayer(player)` — apply disc bonuses to base stats
2. Fatigue penalty = `holeIndex × (1 − fitness/100)` applied to all effective stats
3. Injury penalty = `activeInjuries.length × 5` subtracted from performance total
4. Weighted performance score from 6 stats (see weights above)
5. Add terrain modifiers from course data (OB risk, wooded, elevation)
6. Add form bonus, morale bonus, momentum bonus
7. Add random factor
8. Map performance to hole outcome: eagle / birdie / par / bogey / double-bogey / triple

18-hole rounds punish low Fitness more than 9-hole rounds (fatigue is not normalised).

### PDGA Rating Calibration

Each round, all players serve as propagators using their pre-tournament rating.
A calibration line is fitted: each stroke maps to a rating delta.
Event rating per player = average of per-round propagator ratings.
This ensures ratings stay anchored to real scoring distributions.

## Economy

- **Entry fees**: 5% of prize pool × difficulty scalar (difficulty 1 = ×1.0, difficulty 5 = ×1.4)
- **Club Sponsor upgrade**: reduces entry fee by 10% (Lv1) or 20% (Lv2)
- **Prize money**: distributed by finish position (`PRIZE_SHARES`)
- **Net earnings**: prize money − entry fee (floored at 0)
- **Reputation**: earned from best club finisher's placement; gates tournament access
- **Starting money**: 2000

Reputation unlock thresholds: 0 (beginner) → 275 (elite) across 10 tournaments.

## Club Facilities (Upgrades)

Four facility upgrades, each with 2 levels. Purchased via the Facilities screen.

| Upgrade | Level 1 | Level 2 | Cost |
|---------|---------|---------|------|
| Training Center | −15% training cost | −30% training cost | 800 / 2000 |
| Video Analysis | +1 bonus stat boost | +2 bonus stat boost | 600 / 1500 |
| Medical Team | +1 week injury recovery/round | +2 weeks injury recovery/round | 500 / 1200 |
| Club Sponsor | −10% entry fee | −20% entry fee | 400 / 1000 |

Training Center discount and Video Analysis boost both apply in `trainPlayer`.  
Medical Team applies in `advanceSeason` (before round tick).  
Club Sponsor applies in `enterTournament` (fee charged at discounted rate).

## Tournament Design

| Property | Range |
|----------|-------|
| Holes | 9 or 18 |
| Difficulty | 1–5 |
| Prize pool | Scales with difficulty |
| Rep required | 0–275 |
| Rounds | 1–3 |

AI field: 8+ opponents per tournament, drawn from the 100-NPC persistent roster,
sampled by skill tier to match tournament difficulty.

## Season Progression

One season = 5 rounds. Each round:

1. **Shop** — buy/equip discs (gated: must fully equip all players to proceed)
2. **Training** — choose stat boosts + access Facilities upgrades
3. **Tournament** — pick event, simulate, collect prizes + reputation
4. **Results** — hole-by-hole playback, then full leaderboard

After 5 rounds: season summary + `SeasonSnapshot` saved to `clubHistory`, then next season.  
Club, roster, inventory, upgrades, and NPC roster all carry over between seasons.

## Achievements

Unlocked based on cumulative performance:

| Achievement | Condition |
|-------------|-----------|
| First Win | Win a tournament |
| 3 Tournaments Played | Play 3 tournaments |
| 100 Reputation | Reach 100 club reputation |

Streak: consecutive top-3 finishes. Shown as a flame chip in the HUD (≥2 streak).

## Club History

At end of each season, a `SeasonSnapshot` is saved:
`{ season, tournamentsPlayed, wins, bestPlacement, totalEarnings, reputationGained, endReputation }`

Shown in `ClubHistoryModal` as a table + two SVG line charts (earnings, reputation).

## NPC Roster

100 persistent NPCs generated at new game start, 5 skill tiers × 20 players (Croatian names).
They accumulate ratings from tournaments they participate in, building a realistic competitive
landscape the player can track their rise through on the global ranking list.

## Future Systems

See [`ROADMAP.md`](./ROADMAP.md).
