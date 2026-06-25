import { useCallback, useEffect, useState } from "react";

/**
 * Index + direction state for a card carousel, with clamped stepping, jump-to,
 * and left/right arrow-key navigation. Extracted from the old Explore gallery so
 * both the coverflow and any future browser share one implementation.
 *
 * `dir` is the last movement direction (-1 / 0 / +1) for entrance animations.
 */
export function useCarousel(count: number, initialIndex = 0) {
  const [[index, dir], setState] = useState<[number, number]>([initialIndex, 0]);

  const clamp = useCallback(
    (i: number) => Math.min(Math.max(i, 0), Math.max(count - 1, 0)),
    [count]
  );

  const go = useCallback(
    (delta: number) => {
      setState(([i]) => [clamp(i + delta), delta]);
    },
    [clamp]
  );

  const goTo = useCallback(
    (target: number) => {
      setState(([i]) => {
        const next = clamp(target);
        return [next, next === i ? 0 : next > i ? 1 : -1];
      });
    },
    [clamp]
  );

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return { index, dir, go, goTo };
}
