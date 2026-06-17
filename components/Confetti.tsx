"use client";

import { useMemo } from "react";

const COLORS = ["#facc15", "#4ade80", "#38bdf8", "#f472b6", "#fb923c", "#a78bfa"];

/** One-shot confetti burst, e.g. for a 1st-place tournament result. */
export default function Confetti({ count = 50 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.8 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
      })),
    [count]
  );

  return (
    <div className="confetti-host" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
