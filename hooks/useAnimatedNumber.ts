import { useEffect, useRef, useState } from "react";

/**
 * Smoothly counts a displayed number from its previous value up (or down) to
 * `target` whenever `target` changes, instead of jumping instantly.
 */
export function useAnimatedNumber(target: number, duration = 500): number {
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    const to = target;
    if (from === to) return;

    let rafId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevTarget.current = to;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}
