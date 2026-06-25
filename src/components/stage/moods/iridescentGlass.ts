import type { MoodPreset } from "./types";
import { FRAG_HEADER, NOISE_GLSL } from "./shared.glsl";

const fragmentShader = /* glsl */ `
  ${FRAG_HEADER}
  ${NOISE_GLSL}

  // Cosine palette -> smooth holographic hue ramp.
  vec3 hue(float h) {
    return 0.5 + 0.5 * cos(6.28318 * (h + vec3(0.0, 0.33, 0.67)));
  }

  void main() {
    vec2 p = centered(vUv, uResolution);
    float t = uTime * 0.06;

    float n  = fbm(p * 1.8 + vec2(t, -t * 0.7));
    float n2 = fbm(p * 3.0 - vec2(t * 0.5, t));
    float h  = n * 0.6 + n2 * 0.4 + t * 0.1;

    vec3 irid = hue(h);
    vec3 col = mix(uColorA, irid, 0.5);
    col = mix(col, uColorB, smoothstep(0.3, 0.9, n2) * 0.3);

    // Darken the center a touch so cards stay legible.
    col *= mix(0.5, 1.0, smoothstep(0.0, 0.9, length(p)));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const iridescentGlass: MoodPreset = {
  id: "iridescentGlass",
  label: "Iridescent Glass",
  fragmentShader,
  colors: {
    a: "#0a0a12", // dark base
    b: "#1e293b", // cool slate accent
    c: "#111827",
  },
  particles: null,
  bloom: {
    intensity: 0.5,
    luminanceThreshold: 0.6,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
  },
  fallbackCss:
    "linear-gradient(135deg, #0a0a12 0%, #2a1a3a 40%, #103040 70%, #0a0a12 100%)",
};
