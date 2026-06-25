// A "mood" is a self-contained look for the 3D stage: a fragment shader for the
// animated background, optional floating particles, optional bloom, and a CSS
// gradient used as the static fallback (SSR / reduced-motion / no-WebGL).
//
// Adding a mood = one file in this folder + one line in index.ts. Nothing in the
// canvas components needs to change — they read everything off the preset.

export type MoodId =
  | "cosmicNebula"
  | "darkStudio"
  | "mystical"
  | "iridescentGlass";

export interface ParticleConfig {
  /** Number of particles. Keep modest on mobile. */
  count: number;
  /** Hex color. */
  color: string;
  /** Point size. */
  size: number;
  /** Spread of the particle field (world units). */
  scale: number;
  /** Drift speed. */
  speed: number;
  /** 0..1 opacity. */
  opacity: number;
}

export interface BloomConfig {
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
  mipmapBlur: boolean;
}

/** RGB triple as hex strings, fed to the shader as uColorA/B/C. */
export interface MoodColors {
  a: string;
  b: string;
  c: string;
}

export interface MoodPreset {
  id: MoodId;
  label: string;
  /**
   * GLSL fragment shader. Receives these uniforms (declared in the shader):
   *   uniform float uTime;        // seconds
   *   uniform vec2  uResolution;  // pixels
   *   uniform vec3  uColorA/B/C;  // from `colors`
   * and the varying `vUv` (0..1) from the shared vertex shader.
   */
  fragmentShader: string;
  colors: MoodColors;
  particles?: ParticleConfig | null;
  bloom?: BloomConfig | null;
  /** A CSS `background` value for the static fallback (and SSR paint). */
  fallbackCss: string;
  /**
   * If set, this is an *image-based* mood: `background` is shown as a CSS cover
   * layer (and is the static fallback), and the WebGL canvas renders
   * transparently over it — just the animated god-rays + dust. When present,
   * `fragmentShader` is unused. Paths are same-origin (in /public), so the
   * images load as WebGL textures without a CORS check.
   */
  images?: {
    background: string;
    godRays?: string;
  };
}
