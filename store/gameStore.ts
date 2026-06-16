import { create } from "zustand";
import type {
  Club,
  Disc,
  Player,
  PlayerStats,
  TournamentResult,
} from "@/types";

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
}

const initialClub: Club = {
  name: "New Club",
  money: 0,
  reputation: 0,
};

export const useGameStore = create<GameState>((set) => ({
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
}));
