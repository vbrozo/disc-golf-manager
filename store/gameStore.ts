import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, type Language } from "@/i18n";
import type {
  Club,
  Disc,
  DiscLoadout,
  DiscType,
  Player,
  PlayerStats,
  TournamentResult,
  TrainingResult,
  TrainingType,
} from "@/types";
import {
  advanceRound,
  applyTraining,
  buildSettlement,
  checkEntryEligibility,
  createStarterRoster,
  equipDisc as equipDiscOnLoadout,
  getDiscById,
  getDiscPrice,
  getTournamentById,
  getTrainingProgram,
  INITIAL_SEASON_STATE,
  recordRoundResult,
  settleClubEconomy,
  simulateTournament,
  startSeason as startSeasonState,
  STARTING_MONEY,
  unequipDisc as unequipDiscFromLoadout,
  type SeasonState,
  type SimulationOptions,
  type TournamentSettlement,
  type TournamentStanding,
  type TrainingOptions,
} from "@/game";

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

  // --- Actions ---
  /** Switch the UI language. */
  setLanguage: (language: Language) => void;
  /** Move the guided flow to a specific stage. */
  setFlowStage: (stage: FlowStage) => void;
  /** Replace the club details (name / money / reputation). */
  setClub: (club: Club) => void;
  /** Adjust the club's money. Pass a negative amount to spend. */
  addMoney: (amount: number) => void;
  /** Patch a single player by id (top-level fields and/or stats). */
  updatePlayer: (
    id: string,
    update: Partial<Omit<Player, "id" | "stats">> & {
      stats?: Partial<PlayerStats>;
    }
  ) => void;
  /** Append a played tournament result to the club's record. */
  addTournamentResult: (result: TournamentResult) => void;
  /**
   * Run a training session on a player, charging the club for the program's
   * cost and raising the trained stat by +1 to +5 (capped at 100). Returns the
   * {@link TrainingResult}, or `null` if the player/program is unknown or the
   * club cannot afford it (in which case nothing changes).
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
   * {@link EnterTournamentResult}, or `null` if the tournament is unknown, the
   * club is locked out (reputation) or cannot afford the entry fee, or the club
   * has no players — in which case nothing changes.
   */
  enterTournament: (
    tournamentId: string,
    options?: SimulationOptions
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
    options?: SimulationOptions
  ) => EnterTournamentResult | null;
  /**
   * Finish the "training" phase and advance: move to the next round's "select"
   * phase, or mark the season "complete" if every round has been played.
   * Returns the resulting {@link SeasonState}.
   */
  advanceSeason: () => SeasonState;
}

const initialClub: Club = {
  name: "New Club",
  money: 0,
  reputation: 0,
};

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
        player.id === id
          ? {
              ...player,
              ...update,
              stats: { ...player.stats, ...(update.stats ?? {}) },
            }
          : player
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

    // Reject unknown program/player or an unaffordable session — no changes.
    if (!program || !player || state.club.money < program.cost) {
      return null;
    }

    const outcome = applyTraining(player, type, options);
    if (!outcome) {
      return null;
    }

    set((s) => ({
      club: { ...s.club, money: s.club.money - program.cost },
      players: s.players.map((p) => (p.id === id ? outcome.player : p)),
    }));

    return outcome.result;
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

    // Reputation gate + entry-fee affordability — reject without changes.
    const eligibility = checkEntryEligibility(state.club, tournament);
    if (!eligibility.canEnter) {
      return null;
    }

    const simulation = simulateTournament(state.players, tournament, options);
    // The club's best finisher represents it for prize money and reputation.
    const best = simulation.standings[0];
    if (!best) {
      return null;
    }

    const settlement = buildSettlement(
      tournament,
      best.earnings,
      best.reputationGained
    );

    const result: TournamentResult = {
      id: `result-${Date.now()}-${tournament.id}`,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      placement: best.placement,
      earnings: settlement.earnings,
      reputationGained: settlement.reputationGained,
    };

    set((s) => ({
      club: settleClubEconomy(s.club, settlement),
      tournaments: [...s.tournaments, result],
    }));

    return { settlement, result, standings: simulation.standings };
  },

  // --- Game loop (season) ---

  startNewGame: (options) =>
    set((state) => {
      const clubName = options?.clubName?.trim() || "New Club";
      const roster = createStarterRoster().map((player, index) => {
        const customName = options?.playerNames?.[index]?.trim();
        return customName ? { ...player, name: customName } : player;
      });

      return {
        club: { ...state.club, name: clubName, money: STARTING_MONEY, reputation: 0 },
        players: roster,
        tournaments: [],
        inventory: [],
        season: startSeasonState(INITIAL_SEASON_STATE),
        // A brand-new game starts the guided onboarding at the intro.
        flowStage: "intro" as FlowStage,
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
    set((state) => ({ season: advanceRound(state.season) }));
    return get().season;
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
      }),
      // Skip automatic hydration so the server and first client render both use
      // the default state (no mismatch). A client-only effect rehydrates after
      // mount — see components/StoreHydrator.tsx.
      skipHydration: true,
    }
  )
);
