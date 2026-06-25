import { Suspense, lazy, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ClientOnly } from "@/components/ClientOnly";
import { getMood, type MoodId } from "./moods";
import { StaticStageFallback } from "./StaticStageFallback";
import { StageErrorBoundary } from "./StageErrorBoundary";

// Lazy so three.js / R3F / drei / postprocessing are split into a client-only
// chunk and never enter the SSR module graph.
const StageCanvas = lazy(() =>
  import("./StageCanvas").then((m) => ({ default: m.StageCanvas }))
);

/**
 * Full-cover animated background for the immersive stage. Renders the live
 * shader canvas on the client, and a static gradient for SSR / reduced-motion /
 * WebGL failure. Always `pointer-events-none` so the DOM cards above receive
 * input.
 */
export function Stage({ mood }: { mood?: MoodId }) {
  const preset = getMood(mood);
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  const base = <StaticStageFallback preset={preset} />;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      {/* Base layer: the studio image (or mood gradient). Always painted, so it
          shows on SSR / reduced-motion / WebGL failure, and sits behind the
          transparent canvas for image-based moods. */}
      {base}

      {!(reduceMotion || failed) && (
        <ClientOnly fallback={null}>
          {() => (
            <StageErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <StageCanvas preset={preset} onLost={() => setFailed(true)} />
              </Suspense>
            </StageErrorBoundary>
          )}
        </ClientOnly>
      )}
    </div>
  );
}
