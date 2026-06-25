import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import type { MoodPreset } from "./moods/types";
import { MoodScene } from "./MoodScene";

/**
 * The R3F canvas. Must only ever render on the client (wrap in <ClientOnly>).
 * - Pauses the render loop when the tab is hidden (battery / GPU).
 * - Clamps DPR so we never render the soft background at full retina.
 * - Reports WebGL context loss so the parent can fall back to a static gradient.
 */
export function StageCanvas({
  preset,
  onLost,
}: {
  preset: MoodPreset;
  onLost?: () => void;
}) {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const onVis = () =>
      setFrameloop(
        document.visibilityState === "visible" ? "always" : "never"
      );
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Image-based moods draw over a CSS backdrop, so the canvas must be
  // transparent; procedural shader moods fill the frame opaquely.
  const transparent = !!preset.images;

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: transparent,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onLost?.();
          },
          { once: true }
        );
      }}
    >
      <Suspense fallback={null}>
        <MoodScene key={preset.id} preset={preset} />
      </Suspense>
    </Canvas>
  );
}
