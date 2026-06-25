import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MoodPreset } from "./moods/types";

/**
 * Scene for an image-based mood (the cool dark studio). The studio backdrop is
 * a CSS layer behind this (transparent) canvas; here we add the living
 * atmosphere: slowly breathing god-rays (additive) and drifting dust motes.
 */
export function StudioScene({ preset }: { preset: MoodPreset }) {
  const rays = preset.images?.godRays;
  const p = preset.particles;

  return (
    <>
      {rays && <GodRays src={rays} />}
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
    </>
  );
}

function GodRays({ src }: { src: string }) {
  const tex = useTexture(src);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      // Gentle breathing intensity.
      matRef.current.opacity = 0.34 + 0.12 * Math.sin(t * 0.5);
    }
    if (meshRef.current) {
      // Slow overscan drift so the beams feel alive.
      const s = 1.08 + 0.03 * Math.sin(t * 0.18);
      meshRef.current.scale.set(viewport.width * s, viewport.height * s, 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0.1]}
      scale={[viewport.width * 1.08, viewport.height * 1.08, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.34}
      />
    </mesh>
  );
}
