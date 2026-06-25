import type { MoodPreset } from "./types";
import { FRAG_HEADER, NOISE_GLSL } from "./shared.glsl";

const fragmentShader = /* glsl */ `
  ${FRAG_HEADER}
  ${NOISE_GLSL}

  void main() {
    vec2 p = centered(vUv, uResolution);
    float t = uTime * 0.03;

    // Two drifting noise layers form the nebula.
    vec2 q = p * 1.5;
    float n  = fbm(q + vec2(t, t * 0.5));
    float n2 = fbm(q * 2.0 - vec2(t * 0.6, t));
    float clouds = smoothstep(0.15, 0.95, n * 0.7 + n2 * 0.45);

    vec3 col = uColorA;
    col = mix(col, uColorB, clouds * 0.75);
    col = mix(col, uColorC, smoothstep(0.45, 1.0, n2) * 0.5);

    // Keep the center calmer/darker so cards read clearly.
    float r = length(p);
    col *= mix(0.35, 1.0, smoothstep(0.0, 0.85, r));

    // Sparse twinkling stars.
    vec2 sp = floor(vUv * uResolution / 2.5);
    float starField = step(0.992, hash(sp));
    float tw = 0.5 + 0.5 * sin(uTime * 2.0 + hash(sp) * 100.0);
    col += starField * tw * 0.7;

    // Soft outer vignette.
    col *= smoothstep(1.35, 0.25, r);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const cosmicNebula: MoodPreset = {
  id: "cosmicNebula",
  label: "Cosmic / Nebula",
  fragmentShader,
  colors: {
    a: "#0a0a1f", // deep navy base
    b: "#6d28d9", // violet nebula
    c: "#0e7490", // teal nebula
  },
  particles: {
    count: 350,
    color: "#cbd5f5",
    size: 2,
    scale: 12,
    speed: 0.2,
    opacity: 0.7,
  },
  bloom: {
    intensity: 0.7,
    luminanceThreshold: 0.55,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
  },
  fallbackCss:
    "radial-gradient(120% 90% at 50% 40%, #1b1145 0%, #0a0a1f 45%, #050510 100%)",
};
