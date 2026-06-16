// Course catalogue for Disc Golf Manager v2.
//
// Frontend-only, framework-free: static game data describing the 18-hole
// courses tournaments are played on.

import type { Course, Hole } from "@/models/Course";

/**
 * Build a hole with reasonable terrain attributes scaled by difficulty tier.
 * `obRisk`/`wooded`/`elevation` are set equal to `difficulty` itself (not a
 * fraction of it): the weighted difficulty score in `holeSimulator.ts` only
 * lands on the same 0-100 scale as player performance if these terms aren't
 * diluted down. Two earlier passes still under-shot this — courses came out
 * far easier than the player/opponent skill range (~45-70), so almost every
 * hole resolved as a birdie or eagle and every round score blew out to
 * unrealistic numbers like -46 over 27 holes.
 */
function hole(par: Hole["par"], distance: number, difficulty: number): Hole {
  return {
    par,
    distance,
    difficulty,
    wooded: difficulty,
    elevation: difficulty,
    obRisk: difficulty,
  };
}

/**
 * Generate a stock 18-hole layout scaled by an overall difficulty tier (1-5).
 * Tier 1's difficulty (~50) is calibrated to sit near the average skill of a
 * starter-roster/rookie-opponent field (~45-70), so a typical early-game
 * round resolves mostly to par with occasional birdies/bogeys rather than a
 * sweep of eagles. Tier 5 tops out near 100, challenging even elite players.
 */
function generateCourse(id: string, name: string, tier: number): Course {
  const baseDifficulty = Math.min(100, 40 + tier * 10);
  const holes: Hole[] = Array.from({ length: 18 }, (_, i) => {
    const par: Hole["par"] = i % 6 === 5 ? 5 : i % 3 === 2 ? 4 : 3;
    const distance = par === 5 ? 550 : par === 4 ? 380 : 220;
    const difficulty = Math.min(100, baseDifficulty + (i % 4) * 3);
    return hole(par, distance + tier * 10, difficulty);
  });
  return { id, name, holes };
}

/** Stock courses, one per tournament difficulty tier. */
export const COURSES: readonly Course[] = [
  generateCourse("course-local-park", "Local Park", 1),
  generateCourse("course-riverside", "Riverside Course", 2),
  generateCourse("course-forest", "Forest Course", 2),
  generateCourse("course-city", "City Course", 3),
  generateCourse("course-mountain", "Mountain Course", 3),
  generateCourse("course-national", "National Course", 4),
  generateCourse("course-continental", "Continental Course", 4),
  generateCourse("course-world", "World Championship Course", 5),
  generateCourse("course-grand-masters", "Grand Masters Course", 5),
] as const;

/** Look up a course by id, or `undefined` if unknown. */
export function getCourseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}
