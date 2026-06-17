// v2 Tournament domain model for Disc Golf Manager.

export interface Tournament {
  id: string;
  name: string;
  /** Course played for every round. */
  courseId: string;
  /** Number of rounds played. */
  rounds: 3 | 4;
  /** Holes played per round, taken from the front of the course's layout. */
  holesPerRound: 9 | 18;
  /** Difficulty rating 1-5, used for entry fees and reputation rewards. */
  difficulty: number;
  prizePool: number;
  /** Minimum club reputation required to enter. */
  reputationRequired: number;
}

/** Outcome of a played tournament, stored on the club's record. */
export interface TournamentResult {
  id: string;
  tournamentId: string;
  tournamentName: string;
  /** Finishing position (1 = winner). */
  placement: number;
  earnings: number;
  reputationGained: number;
  /** Per-player results for club players in this tournament. */
  playerResults?: { playerId: string; playerName: string; placement: number; earnings: number; rating: number }[];
}
