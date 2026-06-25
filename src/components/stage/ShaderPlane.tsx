import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MoodPreset } from "./moods/types";
import { FULLSCREEN_VERT } from "./moods/shared.glsl";

/**
 * A 2x2 plane whose clip-space position is passed straight through (see
 * FULLSCREEN_VERT), so it always fills the viewport regardless of the camera.
 * The fragment shader paints the animated background; `uTime` / `uResolution`
 * are driven here each frame.
 */
export function ShaderPlane({ preset }: { preset: MoodPreset }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorA: { value: new THREE.Color(preset.colors.a) },
      uColorB: { value: new THREE.Color(preset.colors.b) },
      uColorC: { value: new THREE.Color(preset.colors.c) },
    }),
    [preset]
  );

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={FULLSCREEN_VERT}
        fragmentShader={preset.fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
