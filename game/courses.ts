// Course catalogue for Disc Golf Manager v2.
//
// Frontend-only, framework-free: static game data describing the 18-hole
// courses tournaments are played on.

import type { Course, Hole } from "@/models/Course";

/**
 * Per-tier 9-hole par patterns. Early tiers are par-3 heavy (putting/scramble
 * matters most); later tiers shift toward par 4/5 (power/mental challenge).
 * Each pattern repeats twice to make 18 holes.
 */
const PAR_PATTERNS: Record<number, readonly (3 | 4 | 5)[]> = {
  1: [3, 3, 4, 3, 3, 5, 3, 3, 4], // 6×p3 2×p4 1×p5 — putting-heavy
  2: [3, 4, 3, 5, 3, 4, 3, 3, 4], // 5×p3 3×p4 1×p5
  3: [3, 4, 3, 4, 5, 3, 4, 3, 4], // 4×p3 4×p4 1×p5
  4: [4, 3, 4, 5, 3, 4, 3, 4, 5], // 3×p3 4×p4 2×p5
  5: [4, 3, 4, 5, 4, 3, 5, 4, 4], // 2×p3 5×p4 2×p5 — power-heavy
};

/**
 * Five hole characters that cycle through each course, giving each hole a
 * distinct terrain emphasis. Multipliers are applied to the hole's base
 * difficulty to derive secondary attributes (obRisk, wooded, elevation).
 * Characters map to hole types in holeSimulator.holeType():
 *   0 → Recovery (OB-heavy), 1 → Technical (wooded), 2 → Pressure (elevated),
 *   3 → Balanced, 4 → Short/Open (low hazards, putting focus on par-3)
 */
const HOLE_CHARS = [
  { obMult: 1.30, woodedMult: 0.65, elevMult: 0.60 }, // 0: OB-heavy  → Recovery
  { obMult: 0.65, woodedMult: 1.30, elevMult: 0.60 }, // 1: Wooded    → Technical
  { obMult: 0.85, woodedMult: 0.85, elevMult: 1.25 }, // 2: Elevated  → Pressure (par4) / Short (par3)
  { obMult: 0.90, woodedMult: 0.90, elevMult: 0.80 }, // 3: Balanced  → Balanced (par4) / Short (par3)
  { obMult: 0.65, woodedMult: 0.65, elevMult: 0.50 }, // 4: Open      → Short (par3) / Balanced (par4)
] as const;

/**
 * Generate a stock 18-hole layout scaled by an overall difficulty tier (1–5).
 * Each hole gets a par from the tier's PAR_PATTERN and terrain attributes from
 * the cycling HOLE_CHARS, producing a mix of hole types (Recovery, Technical,
 * Short, Long, Pressure, Balanced) so every player specialty has relevant holes.
 */
function generateCourse(id: string, name: string, tier: number): Course {
  const baseDifficulty = Math.min(100, 40 + tier * 10);
  const parPattern = PAR_PATTERNS[tier] ?? PAR_PATTERNS[3];

  const holes: Hole[] = Array.from({ length: 18 }, (_, i) => {
    const par = parPattern[i % 9];
    const baseDist = par === 5 ? 550 : par === 4 ? 380 : 220;
    const distance = baseDist + tier * 10;
    const difficulty = Math.min(100, baseDifficulty + (i % 4) * 3);

    const char = HOLE_CHARS[i % 5];
    const obRisk    = Math.min(100, Math.round(difficulty * char.obMult));
    const wooded    = Math.min(100, Math.round(difficulty * char.woodedMult));
    const elevation = Math.min(100, Math.round(difficulty * char.elevMult));

    return { par, distance, difficulty, obRisk, wooded, elevation };
  });

  return { id, name, holes };
}

/** Stock courses, one per tournament difficulty tier. */
export const COURSES: readonly Course[] = [
  generateCourse("course-local-park",    "Local Park",                1),
  generateCourse("course-riverside",     "Riverside Course",          2),
  generateCourse("course-forest",        "Forest Course",             2),
  generateCourse("course-city",          "City Course",               3),
  generateCourse("course-mountain",      "Mountain Course",           3),
  generateCourse("course-national",      "National Course",           4),
  generateCourse("course-continental",   "Continental Course",        4),
  generateCourse("course-world",         "World Championship Course", 5),
  generateCourse("course-grand-masters", "Grand Masters Course",      5),
] as const;

/** Look up a course by id, or `undefined` if unknown. */
export function getCourseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}
