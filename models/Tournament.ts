// v2 Tournament domain model for Disc Golf Manager.

export interface Tournament {
  id: string;
  name: string;
  /** Course played for all 4 rounds. */
  courseId: string;
  /** Number of 18-hole rounds played (always 4 for a full tournament). */
  rounds: number;
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
}
