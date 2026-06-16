// v2 Course/Hole domain model for Disc Golf Manager.

export interface Hole {
  par: 3 | 4 | 5;
  distance: number;
  difficulty: number;
  wooded: number;
  elevation: number;
  obRisk: number;
}

/** An 18-hole disc golf course. */
export interface Course {
  id: string;
  name: string;
  holes: Hole[];
}
