import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, type Language } from "@/i18n";
import type { Club } from "@/models/Club";
import type { Disc, DiscLoadout, DiscType } from "@/models/Disc";
import type { Player } from "@/models/Player";
import type { Tournament, TournamentResult } from "@/models/Tournament";
import type { TrainingResult, TrainingType } from "@/types";
import { generateTournamentInjuries } from "@/game/simulation/tournamentSimulator";
import {
  advanceRound,
  applyTraining,
  buildSettlement,
  checkEntryEligibility,
  calculateRoundRatingsFromPropagators,
  createStarterRoster,
  DEFAULT_FIELD_SIZE,
  equipDisc as equipDiscOnLoadout,
  generateNpcRoster,
  generateOpponents,
  getCourseById,
  getUpgradeById,
  trainingCostMultiplier,
  trainingBoostBonus,
  injuryRecoveryBonus,
  entryFeeMultiplier,
  getDiscById,
  getDiscPrice,
  getTournamentById,
  getTrainingProgram,
  INITIAL_SEASON_STATE,
  recordRoundResult,
  sampleNpcsForTournament,
  settleClubEconomy,
  simulateTournament,
  startSeason as startSeasonState,
  STARTING_MONEY,
  unequipDisc as unequipDiscFromLoadout,
  type SeasonState,
  type HoleOutcome,
  type TournamentSimulationOptions,
  type TournamentSettlement,
  type TournamentStanding,
  type TrainingOptions,
} from "@/game";
import { appendRoundRating, averageRating } from "@/game/rating";

/**
 * Everything a UI needs after the club enters a tournament: the money +
 * reputation {@link TournamentSettlement}, the {@link TournamentResult} that
 * was appended to the club's record, and the full simulated standings.
 */
export interface EnterTournamentResult {
  settlement: TournamentSettlement;
  result: TournamentResult;
  standings: TournamentStanding[];
}

/** End-of-season performance snapshot stored in {@link GameState.clubHistory}. */
export interface SeasonSnapshot {
  season: number;
  tournamentsPlayed: number;
  wins: number;
  bestPlacement: number | null;
  totalEarnings: number;
  reputationGained: number;
  /** Club reputation at the moment the season ended. */
  endReputation: number;
}

/** A single row of a tournament's final leaderboard, for the results screen. */
export interface LeaderboardRow {
  playerName: string;
  /** Finishing position (1 = winner). */
  placement: number;
  earnings: number;
  reputationGained: number;
  /** PDGA-style rating earned for this tournament. */
  rating: number;
  /** Total strokes relative to par across the whole tournament (lower is better). */
  totalScore: number;
  /** True for one of the club's own players, false for an AI opponent. */
  isClubPlayer: boolean;
}

/** One hole's outcome, trimmed down for the hole-by-hole results animation. */
export interface HoleByHoleEntry {
  outcome: HoleOutcome;
  scoreToPar: number;
}

/** One club player's per-round hole sequences for the results animation. */
export interface PlayerHoleTrack {
  playerName: string;
  /** Each element is one round's worth of holes, in round order. */
  rounds: HoleByHoleEntry[][];
}

/** The full standings of the most recent tournament, kept for the results screen. */
export interface TournamentSummary {
  tournamentName: string;
  rows: LeaderboardRow[];
  /** Total prize money the club's players earned (gross, before the entry fee). */
  clubEarnings: number;
  /** Reputation the club gained from its best finisher. */
  clubReputation: number;
  /** Per-club-player hole sequences for the playback animation, ordered best first. */
  playerTracks: PlayerHoleTrack[];
  /** Injuries sustained by club players during this tournament. */
  newInjuries?: import("@/game/simulation/tournamentSimulator").TournamentInjury[];
}

/**
 * Guided onboarding / play flow, layered on top of the season engine. It walks
 * a new player through one focused screen at a time:
 *   intro → shop (buy + equip discs) → training → tournament → training → …
 * `complete` is reached when the season's rounds are all played.
 */
export type FlowStage =
  | "intro"
  | "shop"
  | "training"
  | "tournament"
  | "results"
  | "complete";

/** Options for seeding a brand-new game from the club-creation screen. */
export interface NewGameOptions {
  /** Name for the new club (defaults to "New Club" if blank). */
  clubName?: string;
  /**
   * Optional player names applied to the starter roster in order. Missing or
   * blank entries keep the default starter name for that slot.
   */
  playerNames?: string[];
}

/** Shape of the persisted-in-memory game state. */
export interface GameState {
  club: Club;
  players: Player[];
  /** Record of tournaments the club has played. */
  tournaments: TournamentResult[];
  /** Discs owned by the club. */
  inventory: Disc[];
  /** State of the season game loop (start → play → train → repeat). */
  season: SeasonState;
  /** Active UI language. */
  language: Language;
  /** Current step of the guided onboarding / play flow. */
  flowStage: FlowStage;
  /** Final standings of the most recent tournament, shown on the results step. */
  lastTournament: TournamentSummary | null;
  /** 100 persistent NPC players that compete in every tournament and appear on the ranking list. */
  npcRoster: Player[];
  /** End-of-season performance snapshots, one per completed season. */
  clubHistory: SeasonSnapshot[];
  /** Purchased facility upgrades: upgrade id → current level (1 or 2). */
  clubUpgrades: Record<string, number>;

  // --- Actions ---
  /** Switch the UI language. */
  setLanguage: (language: Language) => void;
  /** Move the guided flow to a specific stage. */
  setFlowStage: (stage: FlowStage) => void;
  /** Replace the club details (name / money / reputation). */
  setClub: (club: Club) => void;
  /** Adjust the club's money. Pass a negative amount to spend. */
  addMoney: (amount: number) => void;
  /** Patch a single player by id. */
  updatePlayer: (id: string, update: Partial<Omit<Player, "id">>) => void;
  /** Append a played tournament result to the club's record. */
  addTournamentResult: (result: TournamentResult) => void;
  /**
   * Run a training session on a player, charging the club for the program's
   * cost and raising the trained attribute by +1 to +5 (capped at 100).
   * Returns the {@link TrainingResult}, or `null` if the player/program is
   * unknown or the club cannot afford it (in which case nothing changes).
   */
  trainPlayer: (
    id: string,
    type: TrainingType,
    options?: TrainingOptions
  ) => TrainingResult | null;
  /** Add a disc to the club's inventory. */
  addDisc: (disc: Disc) => void;
  /**
   * Buy a disc from the shop catalogue: charges the club the disc's price and
   * adds a fresh copy to the inventory. Returns the purchased {@link Disc}, or
   * `null` if the disc id is unknown or the club cannot afford it (in which case
   * nothing changes).
   */
  buyDisc: (discId: string) => Disc | null;
  /**
   * Buy several copies of the same catalogue disc in one purchase: charges the
   * club the total price (disc price × quantity) and adds that many uniquely-id'd
   * copies to the inventory. Returns the purchased {@link Disc} copies, or `null`
   * if the disc id is unknown, the quantity is not a positive integer, or the
   * club cannot afford the full purchase (in which case nothing changes).
   */
  buyDiscs: (discId: string, quantity: number) => Disc[] | null;
  /**
   * Equip a disc the club owns onto a player. Equip rules allow one disc per
   * type, so it replaces whatever the player has in that type's slot. Returns
   * the player's new {@link DiscLoadout}, or `null` if the player or disc is
   * unknown (in which case nothing changes).
   */
  equipDisc: (playerId: string, discId: string) => DiscLoadout | null;
  /**
   * Unequip the disc in a player's given type slot. Returns the player's new
   * {@link DiscLoadout}, or `null` if the player is unknown.
   */
  unequipDisc: (playerId: string, type: DiscType) => DiscLoadout | null;
  /**
   * Enter a tournament with the club's roster. Charges the entry fee, simulates
   * the event, then credits the club with the prize money (net of the fee) and
   * reputation earned by its best finisher, and records the result. Returns an
   * {@link EnterTournamentResult}, or `null` if the tournament/course is
   * unknown, the club is locked out (reputation) or cannot afford the entry
   * fee, or the club has no players — in which case nothing changes.
   */
  enterTournament: (
    tournamentId: string,
    options?: TournamentSimulationOptions
  ) => EnterTournamentResult | null;

  // --- Game loop (season) ---
  /**
   * Start a brand-new game: reset the club to its starting money + zero
   * reputation, seed the default roster, clear inventory and tournament
   * history, and kick off season 1 in the "select" phase. This is the loop's
   * entry point ("Start season"). Optionally names the club and overrides the
   * starter roster's player names.
   */
  startNewGame: (options?: NewGameOptions) => void;
  /**
   * Begin the next season, keeping the club, roster and progress earned so far
   * but resetting the round counter and per-season results. Use this once a
   * season is "complete" to play on. Returns the new {@link SeasonState}.
   */
  startSeason: () => SeasonState;
  /**
   * Play this round's tournament: simulate it, settle the rewards and record
   * the result, then advance the loop into the "training" phase. Only valid in
   * the "select" phase — returns `null` (no changes) otherwise, or if the
   * underlying entry is rejected (unknown/locked/unaffordable/no players).
   */
  playTournamentRound: (
    tournamentId: string,
    options?: TournamentSimulationOptions
  ) => EnterTournamentResult | null;
  /**
   * Finish the "training" phase and advance: move to the next round's "select"
   * phase, or mark the season "complete" if every round has been played.
   * Returns the resulting {@link SeasonState}.
   */
  advanceSeason: () => SeasonState;
  /**
   * Purchase the next level of a club upgrade. Charges the club the upgrade's
   * cost. Returns `true` on success, `false` if already maxed or unaffordable.
   */
  purchaseUpgrade: (id: string) => boolean;
}

const initialClub: Club = {
  id: "club-1",
  name: "New Club",
  money: 0,
  reputation: 0,
};

/** Split a player's first/last name to build a display name for a given player. */
function playerDisplayName(player: Player): string {
  return `${player.firstName} ${player.lastName}`.trim();
}

/** Apply a new round rating to a player, updating their rolling history. */
function applyRoundRating(player: Player, roundRating: number): Player {
  const ratingHistory = appendRoundRating(player.ratingHistory, roundRating);
  const rating = averageRating(ratingHistory) ?? player.rating;
  return { ...player, ratingHistory, rating };
}

/**
 * Build the serialisable leaderboard summary stored for the results screen.
 * `eventRatingById` maps each player id to their event rating (average of
 * per-round propagator ratings) for display in the results table.
 */
function buildTournamentSummary(
  simulation: ReturnType<typeof simulateTournament>,
  tournament: { name: string },
  settlement: TournamentSettlement,
  eventRatingById: Map<string, number>
): TournamentSummary {
  const clubStandings = simulation.standings.filter((s) => !s.player.isOpponent);

  return {
    tournamentName: tournament.name,
    rows: simulation.standings.map((s) => ({
      playerName: playerDisplayName(s.player),
      placement: s.placement,
      earnings: s.earnings,
      reputationGained: s.reputationGained,
      rating: eventRatingById.get(s.player.id) ?? 0,
      totalScore: s.totalScore,
      isClubPlayer: !s.player.isOpponent,
    })),
    clubEarnings: settlement.earnings,
    clubReputation: settlement.reputationGained,
    playerTracks: clubStandings.map((s) => ({
      playerName: playerDisplayName(s.player),
      rounds: s.rounds.map((round) =>
        round.holes.map((hole) => ({
          outcome: hole.outcome,
          scoreToPar: hole.scoreToPar,
        }))
      ),
    })),
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  club: initialClub,
  players: [],
  tournaments: [],
  inventory: [],
  season: INITIAL_SEASON_STATE,
  language: DEFAULT_LANGUAGE,
  flowStage: "intro",
  lastTournament: null,
  npcRoster: [],
  clubHistory: [],
  clubUpgrades: {},

  setLanguage: (language) => set({ language }),

  setFlowStage: (stage) => set({ flowStage: stage }),

  setClub: (club) => set({ club }),

  addMoney: (amount) =>
    set((state) => ({
      club: { ...state.club, money: state.club.money + amount },
    })),

  updatePlayer: (id, update) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, ...update } : player
      ),
    })),

  addTournamentResult: (result) =>
    set((state) => ({
      tournaments: [...state.tournaments, result],
    })),

  trainPlayer: (id, type, options) => {
    const state = get();
    const program = getTrainingProgram(type);
    const player = state.players.find((p) => p.id === id);

    if (!program || !player) return null;

    // Apply Training Center cost discount.
    const costMult = trainingCostMultiplier(state.clubUpgrades);
    const effectiveCost = Math.round(program.cost * costMult);

    if (state.club.money < effectiveCost) return null;

    // Apply Video Analysis boost bonus (extra +N on top of random roll).
    const boostBonus = trainingBoostBonus(state.clubUpgrades);
    const outcome = applyTraining(player, type, options);
    if (!outcome) return null;

    const baseStat = outcome.player[program.stat as keyof typeof outcome.player] as number;
    const boostedStat = Math.min(100, baseStat + boostBonus);
    const boostedPlayer = boostBonus > 0
      ? { ...outcome.player, [program.stat]: boostedStat }
      : outcome.player;
    const originalStat = player[program.stat as keyof typeof player] as number;
    const finalStat = boostBonus > 0 ? boostedStat : baseStat;
    const finalBoost = finalStat - originalStat;

    // Stat already at cap — don't charge money for zero gain.
    if (finalBoost === 0) return null;

    const result = {
      ...outcome.result,
      cost: effectiveCost,
      boost: finalBoost,
      newValue: finalStat,
    };

    set((s) => ({
      club: { ...s.club, money: s.club.money - effectiveCost },
      players: s.players.map((p) => (p.id === id ? boostedPlayer : p)),
    }));

    return result;
  },

  addDisc: (disc) =>
    set((state) => ({ inventory: [...state.inventory, disc] })),

  buyDisc: (discId) => {
    const state = get();
    const catalogueDisc = getDiscById(discId);

    // Reject an unknown disc or one the club cannot afford — no changes.
    if (!catalogueDisc || state.club.money < getDiscPrice(catalogueDisc)) {
      return null;
    }

    // Give the purchased disc a unique inventory id so a club can own several
    // copies of the same catalogue disc without key collisions.
    const owned: Disc = {
      ...catalogueDisc,
      id: `${catalogueDisc.id}-${Date.now()}`,
    };

    set((s) => ({
      club: { ...s.club, money: s.club.money - getDiscPrice(catalogueDisc) },
      inventory: [...s.inventory, owned],
    }));

    return owned;
  },

  buyDiscs: (discId, quantity) => {
    const state = get();
    const catalogueDisc = getDiscById(discId);
    const qty = Math.floor(quantity);

    // Reject an unknown disc, a non-positive quantity, or a purchase the club
    // cannot fully afford — no changes.
    if (!catalogueDisc || qty < 1) {
      return null;
    }
    const totalPrice = getDiscPrice(catalogueDisc) * qty;
    if (state.club.money < totalPrice) {
      return null;
    }

    // Give each purchased disc a unique inventory id so a club can own several
    // copies of the same catalogue disc without key collisions.
    const owned: Disc[] = Array.from({ length: qty }, (_, i) => ({
      ...catalogueDisc,
      id: `${catalogueDisc.id}-${Date.now()}-${i}`,
    }));

    set((s) => ({
      club: { ...s.club, money: s.club.money - totalPrice },
      inventory: [...s.inventory, ...owned],
    }));

    return owned;
  },

  equipDisc: (playerId, discId) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);
    const disc = state.inventory.find((d) => d.id === discId);

    // Reject unknown player or a disc the club does not own — no changes.
    if (!player || !disc) {
      return null;
    }

    const loadout = equipDiscOnLoadout(player.equipped ?? {}, disc);

    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, equipped: loadout } : p
      ),
    }));

    return loadout;
  },

  unequipDisc: (playerId, type) => {
    const state = get();
    const player = state.players.find((p) => p.id === playerId);

    if (!player) {
      return null;
    }

    const loadout = unequipDiscFromLoadout(player.equipped ?? {}, type);

    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, equipped: loadout } : p
      ),
    }));

    return loadout;
  },

  enterTournament: (tournamentId, options) => {
    const state = get();
    const tournament = getTournamentById(tournamentId);

    // Reject an unknown tournament or a club with no one to send.
    if (!tournament || state.players.length === 0) {
      return null;
    }

    const course = getCourseById(tournament.courseId);
    if (!course) {
      return null;
    }

    // Reputation gate check — reject locked tournaments.
    const eligibility = checkEntryEligibility(state.club, tournament);
    if (eligibility.reason === "locked") return null;

    // Apply Club Sponsor entry fee discount, then check affordability.
    const feeMult = entryFeeMultiplier(state.clubUpgrades);
    const discountedFee = Math.round(eligibility.entryFee * feeMult);
    if (state.club.money < discountedFee) return null;

    // Fill the field from the persistent NPC roster (falls back to fresh
    // random opponents if the roster hasn't been seeded yet).
    const fieldSize = Math.max(DEFAULT_FIELD_SIZE, state.players.length + 1);
    const neededOpponents = fieldSize - state.players.length;
    const opponents = state.npcRoster.length > 0
      ? sampleNpcsForTournament(
          state.npcRoster,
          tournament.difficulty,
          neededOpponents
        )
      : generateOpponents(neededOpponents);
    const field = [...state.players, ...opponents];

    const simulation = simulateTournament(field, tournament, course, options);
    const clubStandings = simulation.standings.filter(
      (s) => !s.player.isOpponent
    );
    // The club's best finisher represents it for placement + reputation.
    const best = clubStandings[0];
    if (!best) {
      return null;
    }

    // The club banks the prize money earned by every one of its players.
    const clubEarnings = clubStandings.reduce((sum, s) => sum + s.earnings, 0);
    const baseSettlement = buildSettlement(tournament, clubEarnings, best.reputationGained);
    // Override entry fee with the discounted amount.
    const settlement = {
      ...baseSettlement,
      entryFee: discountedFee,
      netMoney: baseSettlement.earnings - discountedFee,
    };

    const result: TournamentResult = {
      id: `result-${Date.now()}-${tournament.id}`,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      placement: best.placement,
      earnings: settlement.earnings,
      reputationGained: settlement.reputationGained,
    };

    // Compute per-round propagator ratings for each round in the tournament.
    // For each round, all players serve as propagators using their pre-tournament
    // rating, and a calibration line is fitted so that each stroke is worth the
    // right number of rating points for this specific course and conditions.
    const perRoundRatingById = new Map<string, number[]>(
      simulation.standings.map((s) => [s.player.id, []])
    );
    for (let r = 0; r < tournament.rounds; r++) {
      const entries = simulation.standings.map((s) => ({
        id: s.player.id,
        score: s.rounds[r].totalScore,
        priorRating: s.player.rating,
      }));
      for (const [id, rr] of calculateRoundRatingsFromPropagators(entries)) {
        perRoundRatingById.get(id)?.push(rr);
      }
    }

    // Event rating = average of the per-round ratings earned in this tournament.
    const eventRatingById = new Map<string, number>(
      Array.from(perRoundRatingById.entries()).map(([id, ratings]) => [
        id,
        Math.round(ratings.reduce((s, r) => s + r, 0) / ratings.length),
      ])
    );

    const summaryBase = buildTournamentSummary(simulation, tournament, settlement, eventRatingById);

    // Roll for injuries on club players after the tournament.
    const newInjuries = generateTournamentInjuries(
      state.players,
      tournament.difficulty,
      options?.rng
    );
    const summary = newInjuries.length > 0 ? { ...summaryBase, newInjuries } : summaryBase;

    result.playerResults = clubStandings.map((s) => {
      return {
        playerId: s.player.id,
        playerName: playerDisplayName(s.player),
        placement: s.placement,
        earnings: s.earnings,
        rating: eventRatingById.get(s.player.id) ?? 0,
      };
    });

    // Build per-player tournament history entries using current season/round.
    const currentSeason = state.season.season;
    const currentRound = state.season.round;
    const historyEntryByPlayerId = new Map<string, { season: number; round: number; tournamentName: string; placement: number; rating: number }>();
    for (const pr of result.playerResults ?? []) {
      historyEntryByPlayerId.set(pr.playerId, {
        season: currentSeason,
        round: currentRound,
        tournamentName: tournament.name,
        placement: pr.placement,
        rating: pr.rating,
      });
    }

    const injuryByPlayerId = new Map(newInjuries.map((i) => [i.playerId, i.injury]));

    set((s) => ({
      club: settleClubEconomy(s.club, settlement),
      tournaments: [...s.tournaments, result],
      lastTournament: summary,
      // Update club players' ratings, tournament history, and new injuries.
      players: s.players.map((p) => {
        const roundRatings = perRoundRatingById.get(p.id);
        const historyEntry = historyEntryByPlayerId.get(p.id);
        const newInjury = injuryByPlayerId.get(p.id);
        let updated = p;
        if (roundRatings?.length) {
          updated = roundRatings.reduce((acc, rr) => applyRoundRating(acc, rr), updated);
        }
        if (historyEntry) {
          updated = {
            ...updated,
            tournamentHistory: [...(updated.tournamentHistory ?? []), historyEntry],
          };
        }
        if (newInjury) {
          updated = {
            ...updated,
            injuries: [...(updated.injuries ?? []), newInjury],
          };
        }
        return updated;
      }),
      // Update NPC ratings for the players that competed in this tournament.
      npcRoster: s.npcRoster.map((npc) => {
        const roundRatings = perRoundRatingById.get(npc.id);
        if (!roundRatings?.length) return npc;
        return roundRatings.reduce((acc, rr) => applyRoundRating(acc, rr), npc);
      }),
    }));

    return { settlement, result, standings: simulation.standings };
  },

  // --- Game loop (season) ---

  startNewGame: (options) =>
    set((state) => {
      const clubName = options?.clubName?.trim() || "New Club";
      const roster = createStarterRoster().map((player, index) => {
        const customName = options?.playerNames?.[index]?.trim();
        if (!customName) {
          return player;
        }
        const [firstName, ...rest] = customName.split(" ");
        return {
          ...player,
          firstName: firstName || player.firstName,
          lastName: rest.join(" ") || player.lastName,
        };
      });

      return {
        club: { ...state.club, name: clubName, money: STARTING_MONEY, reputation: 0 },
        players: roster,
        tournaments: [],
        inventory: [],
        season: startSeasonState(INITIAL_SEASON_STATE),
        flowStage: "intro" as FlowStage,
        lastTournament: null,
        npcRoster: generateNpcRoster(),
        clubHistory: [],
        clubUpgrades: {},
      };
    }),

  startSeason: () => {
    // Later seasons skip onboarding (discs already owned) and go straight to
    // pre-tournament training.
    set((state) => ({
      season: startSeasonState(state.season),
      flowStage: "training",
    }));
    return get().season;
  },

  playTournamentRound: (tournamentId, options) => {
    const state = get();

    // Only playable while the loop is waiting for a tournament pick.
    if (state.season.phase !== "select") {
      return null;
    }

    // Reuse the standalone entry action for the simulate + settle + record
    // economy work, then layer the season bookkeeping on top.
    const outcome = state.enterTournament(tournamentId, options);
    if (!outcome) {
      return null;
    }

    set((s) => ({
      season: recordRoundResult(s.season, {
        tournamentId: outcome.result.tournamentId,
        tournamentName: outcome.result.tournamentName,
        placement: outcome.result.placement,
        earnings: outcome.settlement.earnings,
        reputationGained: outcome.settlement.reputationGained,
      }),
    }));

    return outcome;
  },

  advanceSeason: () => {
    set((state) => {
      const next = advanceRound(state.season);
      // Reduce injury duration (1 round + Medical Team bonus) and remove healed injuries.
      const recoveryPerRound = 1 + injuryRecoveryBonus(state.clubUpgrades);
      const playersWithRecovery = state.players.map((p) => {
        if (!p.injuries?.length) return p;
        const injuries = p.injuries
          .map((inj) => ({ ...inj, weeksRemaining: inj.weeksRemaining - recoveryPerRound }))
          .filter((inj) => inj.weeksRemaining > 0);
        return { ...p, injuries };
      });
      if (next.phase === "complete") {
        const seasonNum = next.season;
        const results = state.season.results;
        const snapshot: SeasonSnapshot = {
          season: seasonNum,
          tournamentsPlayed: results.length,
          wins: results.filter((r) => r.placement === 1).length,
          bestPlacement: results.length > 0 ? Math.min(...results.map((r) => r.placement)) : null,
          totalEarnings: results.reduce((sum, r) => sum + r.earnings, 0),
          reputationGained: results.reduce((sum, r) => sum + r.reputationGained, 0),
          endReputation: state.club.reputation,
        };
        return {
          season: next,
          clubHistory: [...state.clubHistory, snapshot],
          players: playersWithRecovery.map((p) => ({
            ...p,
            seasonHistory: [
              ...(p.seasonHistory ?? []),
              {
                season: seasonNum,
                power: p.power,
                accuracy: p.accuracy,
                putting: p.putting,
                scramble: p.scramble,
                consistency: p.consistency,
                mental: p.mental,
                fitness: p.fitness,
                rating: p.rating ?? 0,
              },
            ],
          })),
        };
      }
      return { season: next, players: playersWithRecovery };
    });
    return get().season;
  },

  purchaseUpgrade: (id) => {
    const state = get();
    const currentLevel = state.clubUpgrades[id] ?? 0;
    const upgrade = getUpgradeById(id);
    if (!upgrade || currentLevel >= upgrade.maxLevel) return false;
    const cost = upgrade.costs[currentLevel];
    if (state.club.money < cost) return false;
    set((s) => ({
      club: { ...s.club, money: s.club.money - cost },
      clubUpgrades: { ...s.clubUpgrades, [id]: currentLevel + 1 },
    }));
    return true;
  },
    }),
    {
      name: "disc-golf-manager",
      // localStorage only exists in the browser; createJSONStorage lazily
      // resolves it so importing the store during SSR never touches it.
      storage: createJSONStorage(() => localStorage),
      // Persist only serialisable game data, never the action functions.
      partialize: (state) => ({
        club: state.club,
        players: state.players,
        tournaments: state.tournaments,
        inventory: state.inventory,
        season: state.season,
        language: state.language,
        flowStage: state.flowStage,
        lastTournament: state.lastTournament,
        npcRoster: state.npcRoster,
        clubHistory: state.clubHistory,
        clubUpgrades: state.clubUpgrades,
      }),
      // Skip automatic hydration so the server and first client render both use
      // the default state (no mismatch). A client-only effect rehydrates after
      // mount — see components/StoreHydrator.tsx.
      skipHydration: true,
    }
  )
);
