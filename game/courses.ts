// Course catalogue for Disc Golf Manager v2.
//
// Frontend-only, framework-free: static game data describing the 18-hole
// courses tournaments are played on.

import type { Course, Hole } from "@/models/Course";

/**
 * Build a hole with reasonable terrain attributes scaled by difficulty tier.
 * `obRisk`/`wooded`/`elevation` are kept close to `difficulty` itself (rather
 * than small fractions of it) so the weighted difficulty score in
 * `holeSimulator.ts` lands on a scale comparable to player performance
 * (0-100); diluting them too much was making every hole far easier than any
 * player's skill, which is why every round used to come back an Eagle-fest.
 */
function hole(par: Hole["par"], distance: number, difficulty: number): Hole {
  return {
    par,
    distance,
    difficulty,
    wooded: Math.min(100, difficulty * 0.8),
    elevation: Math.min(100, difficulty * 0.7),
    obRisk: Math.min(100, difficulty * 0.9),
  };
}

/** Generate a stock 18-hole layout scaled by an overall difficulty tier (1-5). */
function generateCourse(id: string, name: string, tier: number): Course {
  const baseDifficulty = 20 + tier * 15;
  const holes: Hole[] = Array.from({ length: 18 }, (_, i) => {
    const par: Hole["par"] = i % 6 === 5 ? 5 : i % 3 === 2 ? 4 : 3;
    const distance = par === 5 ? 550 : par === 4 ? 380 : 220;
    const difficulty = Math.min(100, baseDifficulty + (i % 4) * 5);
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
