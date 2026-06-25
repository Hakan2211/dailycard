import { Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { MoodPreset } from "./moods/types";
import { ShaderPlane } from "./ShaderPlane";
import { StudioScene } from "./StudioScene";

/**
 * Assembles a mood. Image-based moods (the studio) render the StudioScene over a
 * transparent canvas; procedural moods render a shader background plane plus
 * optional particles and bloom. Everything is read off the preset, so new moods
 * need no changes here.
 */
export function MoodScene({ preset }: { preset: MoodPreset }) {
  if (preset.images) {
    return <StudioScene preset={preset} />;
  }

  const p = preset.particles;
  const b = preset.bloom;

  return (
    <>
      <ShaderPlane preset={preset} />

      {p && (
        <Sparkles
          count={p.count}
          size={p.size}
          scale={p.scale}
          speed={p.speed}
          opacity={p.opacity}
          color={p.color}
        />
      )}

      {b && (
        <EffectComposer>
          <Bloom
            intensity={b.intensity}
            luminanceThreshold={b.luminanceThreshold}
            luminanceSmoothing={b.luminanceSmoothing}
            mipmapBlur={b.mipmapBlur}
          />
        </EffectComposer>
      )}
    </>
  );
}
