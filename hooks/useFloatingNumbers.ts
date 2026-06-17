import { useCallback, useEffect, useRef, useState } from "react";
import type { FloatingNumber } from "@/components/FloatingNumbers";

let nextId = 0;

/** Manages a short-lived stack of floating feedback numbers (e.g. "+$500"). */
export function useFloatingNumbers() {
  const [items, setItems] = useState<FloatingNumber[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const push = useCallback(
    (text: string, tone: "good" | "bad" = "good", groupId?: string) => {
      const id = nextId++;
      setItems((prev) => [...prev, { id, text, tone, groupId }]);
      const timeout = setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 1100);
      timeouts.current.push(timeout);
    },
    []
  );

  return { items, push };
}
