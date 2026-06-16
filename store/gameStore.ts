import { create } from "zustand";
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
  applyTraining,
  equipDisc as equipDiscOnLoadout,
  getTrainingProgram,
  unequipDisc as unequipDiscFromLoadout,
  type TrainingOptions,
} from "@/game";

/** Shape of the persisted-in-memory game state. */
export interface GameState {
  club: Club;
  players: Player[];
  /** Record of tournaments the club has played. */
  tournaments: TournamentResult[];
  /** Discs owned by the club. */
  inventory: Disc[];

  // --- Actions ---
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
}

const initialClub: Club = {
  name: "New Club",
  money: 0,
  reputation: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  club: initialClub,
  players: [],
  tournaments: [],
  inventory: [],

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
}));
