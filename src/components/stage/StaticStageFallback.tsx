import type { MoodPreset } from "./moods/types";

/**
 * Pure-CSS gradient stand-in for the live shader. Used for SSR / first client
 * paint, reduced-motion, and when WebGL is unavailable or its context is lost.
 */
export function StaticStageFallback({ preset }: { preset: MoodPreset }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: preset.fallbackCss }}
      aria-hidden
    />
  );
}
