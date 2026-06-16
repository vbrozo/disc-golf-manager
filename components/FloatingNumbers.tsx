"use client";

export interface FloatingNumber {
  id: number;
  text: string;
  tone: "good" | "bad";
  /** Optional grouping key (e.g. player id) so a shared list can be filtered per-host. */
  groupId?: string;
}

/**
 * Renders a stack of auto-fading floating numbers (e.g. "+$500", "+5 Accuracy!").
 * Parent owns the list and is responsible for removing entries once their
 * animation finishes (~1.1s) — see `useFloatingNumbers`.
 */
export default function FloatingNumbers({
  items,
}: {
  items: FloatingNumber[];
}) {
  return (
    <>
      {items.map((item) => (
        <span
          key={item.id}
          className={`floating-number floating-number-${item.tone}`}
        >
          {item.text}
        </span>
      ))}
    </>
  );
}
