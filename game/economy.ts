// Economy engine for Disc Golf Manager.
//
// Frontend-only, framework-free: no React, no Zustand. Everything here is a
// pure function over the shared domain types, so it can be unit tested in
// isolation and called from store actions or the UI.
//
// This module ties the money side of the game together:
//   - entry fees: what it costs a club to enter a tournament
//   - reputation unlock logic: which tournaments a club may enter
//   - rewards system: prize money + reputation a finish is worth
//   - money gain from tournaments: settling a result onto the club's balance

import type { Club, Tournament } from "@/types";
import { TOURNAMENTS } from "./tournaments";

// ---------------------------------------------------------------------------
// Entry fees
// ---------------------------------------------------------------------------

/**
 * Entry fee charged as a fraction of a tournament's prize pool. Kept low so
 * that a single decent finish more than covers the buy-in, but high-stakes
 * events still represent a real gamble for a cash-strapped club.
 */
export const ENTRY_FEE_RATE = 0.05;

/** Extra entry-fee weighting added per difficulty level above 1 (10% each). */
export const ENTRY_FEE_DIFFICULTY_STEP = 0.1;

/**
 * The cost to enter a tournament. Derived from the prize pool (so richer
 * events cost more to buy into) and nudged up by course difficulty. Rounded to
 * a whole unit and never negative.
 */
export function getEntryFee(tournament: Tournament): number {
  const difficultyMultiplier =
    1 + Math.max(0, tournament.difficulty - 1) * ENTRY_FEE_DIFFICULTY_STEP;
  const fee = tournament.prizePool * ENTRY_FEE_RATE * difficultyMultiplier;
  return Math.max(0, Math.round(fee));
}

// ---------------------------------------------------------------------------
// Reputation unlock logic
// ---------------------------------------------------------------------------

/**
 * Whether a club's reputation is high enough to unlock a tournament, i.e. it
 * meets the event's `reputationRequired` gate.
 */
export function meetsReputationRequirement(
  reputation: number,
  tournament: Tournament
): boolean {
  return reputation >= tournament.reputationRequired;
}

/**
 * Tournaments still locked behind a reputation gate at the given reputation,
 * ordered by requirement (closest to unlocking first).
 */
export function getLockedTournaments(reputation: number): Tournament[] {
  return TOURNAMENTS.filter(
    (tournament) => !meetsReputationRequirement(reputation, tournament)
  ).sort((a, b) => a.reputationRequired - b.reputationRequired);
}

/**
 * The next tournament that would unlock as the club's reputation grows, or
 * `undefined` if every tournament is already available.
 */
export function getNextUnlock(reputation: number): Tournament | undefined {
  return getLockedTournaments(reputation)[0];
}

/**
 * Reputation still needed before `tournament` unlocks. `0` once the gate is
 * met. Useful for "earn N more reputation to enter" UI hints.
 */
export function reputationToUnlock(
  reputation: number,
  tournament: Tournament
): number {
  return Math.max(0, tournament.reputationRequired - reputation);
}

// ---------------------------------------------------------------------------
// Entry eligibility (reputation gate + affordability of the entry fee)
// ---------------------------------------------------------------------------

/** Why a club cannot enter a tournament. */
export type EntryBlockReason = "locked" | "insufficient-funds";

/** Result of checking whether a club may enter a tournament. */
export interface EntryEligibility {
  /** True only if the club meets the reputation gate and can pay the fee. */
  canEnter: boolean;
  /** The entry fee the club would pay. */
  entryFee: number;
  /** Set when `canEnter` is false, explaining the blocker. */
  reason?: EntryBlockReason;
}

/**
 * Check whether a club can enter a tournament. Entry requires both clearing
 * the reputation gate and being able to afford the entry fee; reputation is
 * checked first so a locked event reports "locked" rather than "insufficient
 * funds".
 */
export function checkEntryEligibility(
  club: Club,
  tournament: Tournament
): EntryEligibility {
  const entryFee = getEntryFee(tournament);

  if (!meetsReputationRequirement(club.reputation, tournament)) {
    return { canEnter: false, entryFee, reason: "locked" };
  }

  if (club.money < entryFee) {
    return { canEnter: false, entryFee, reason: "insufficient-funds" };
  }

  return { canEnter: true, entryFee };
}

// ---------------------------------------------------------------------------
// Rewards system + money gain from tournaments
// ---------------------------------------------------------------------------

/**
 * The full money + reputation outcome of a tournament entry, after accounting
 * for the entry fee. This is what gets applied to the club's balance.
 */
export interface TournamentSettlement {
  tournamentId: string;
  tournamentName: string;
  /** Entry fee paid to take part. */
  entryFee: number;
  /** Gross prize money won. */
  earnings: number;
  /** Reputation gained from the finish. */
  reputationGained: number;
  /** Net change to the club's money: `earnings - entryFee` (may be negative). */
  netMoney: number;
}

/**
 * Build the settlement for a finish: combine the gross rewards (prize money +
 * reputation, e.g. from the simulation's standings or
 * {@link calculateRewards}) with the tournament's entry fee to produce the net
 * money change. Pure — no club state is touched.
 */
export function buildSettlement(
  tournament: Tournament,
  earnings: number,
  reputationGained: number
): TournamentSettlement {
  const entryFee = getEntryFee(tournament);
  const safeEarnings = Math.max(0, Math.round(earnings));
  const safeReputation = Math.max(0, Math.round(reputationGained));

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    entryFee,
    earnings: safeEarnings,
    reputationGained: safeReputation,
    netMoney: safeEarnings - entryFee,
  };
}

/**
 * Apply a settlement to a club, returning a new {@link Club} with the prize
 * money credited (net of the entry fee) and the reputation added. Money is
 * floored at 0 so a club can never go into debt. Pure — the input club is not
 * mutated.
 */
export function settleClubEconomy(
  club: Club,
  settlement: TournamentSettlement
): Club {
  return {
    ...club,
    money: Math.max(0, club.money + settlement.netMoney),
    reputation: club.reputation + settlement.reputationGained,
  };
}
