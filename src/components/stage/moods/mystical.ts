import type { MoodPreset } from "./types";
import { FRAG_HEADER, NOISE_GLSL } from "./shared.glsl";

const fragmentShader = /* glsl */ `
  ${FRAG_HEADER}
  ${NOISE_GLSL}

  void main() {
    vec2 p = centered(vUv, uResolution);
    float t = uTime * 0.05;

    // Low rolling fog drifting upward.
    float fog = fbm(vec2(p.x * 2.0, p.y * 3.0 - t));

    vec3 col = uColorA;

    // Warm glow rising from the bottom (candlelight).
    float glow = smoothstep(0.85, -0.45, p.y);
    col = mix(col, uColorB, glow * (0.35 + 0.65 * fog));

    // A faint gold haze near the floor.
    float floorHaze = smoothstep(-0.1, -0.7, p.y) * fog;
    col = mix(col, uColorC, floorHaze * 0.25);

    // Vignette to keep the center dark and clear.
    col *= smoothstep(1.4, 0.2, length(p));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const mystical: MoodPreset = {
  id: "mystical",
  label: "Mystical / Arcane",
  fragmentShader,
  colors: {
    a: "#0c0604", // dark warm base
    b: "#b4530a", // ember amber
    c: "#f59e0b", // gold haze
  },
  particles: {
    count: 200,
    color: "#fbbf24",
    size: 2.5,
    scale: 10,
    speed: 0.15,
    opacity: 0.6,
  },
  bloom: {
    intensity: 0.85,
    luminanceThreshold: 0.4,
    luminanceSmoothing: 0.35,
    mipmapBlur: true,
  },
  fallbackCss:
    "radial-gradient(120% 100% at 50% 100%, #6b2f06 0%, #1a0d05 45%, #0a0503 100%)",
};
