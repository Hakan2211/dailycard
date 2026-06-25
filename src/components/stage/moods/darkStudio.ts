import type { MoodPreset } from "./types";
import { FRAG_HEADER, NOISE_GLSL } from "./shared.glsl";

const fragmentShader = /* glsl */ `
  ${FRAG_HEADER}
  ${NOISE_GLSL}

  void main() {
    vec2 p = centered(vUv, uResolution);

    // Soft overhead spotlight pool, slightly above center.
    vec2 c = vec2(0.0, 0.08);
    float d = length(p - c);
    float pool = smoothstep(1.0, 0.0, d);
    vec3 col = mix(uColorA, uColorB, pow(pool, 1.6));

    // Very subtle drifting grain so it never looks flat.
    float g = fbm(p * 3.0 + uTime * 0.04);
    col += (g - 0.5) * 0.025;

    // Gentle vignette.
    col *= smoothstep(1.4, 0.35, length(p));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const darkStudio: MoodPreset = {
  id: "darkStudio",
  label: "Minimal Dark Studio",
  fragmentShader, // unused while `images` is set (kept as a procedural fallback)
  colors: {
    a: "#070708", // near-black backdrop
    b: "#2b3340", // cool blue-grey light pool
    c: "#0b0d12",
  },
  // Image-based: the generated cool studio backdrop is the base; the WebGL
  // layer adds living god-rays + dust on top.
  images: {
    background: "/stage/studio-cool.jpg",
    godRays: "/stage/godrays.jpg",
  },
  particles: {
    count: 90,
    color: "#dbeafe",
    size: 1.4,
    scale: 9,
    speed: 0.05,
    opacity: 0.18,
  },
  bloom: null,
  fallbackCss:
    "#0a0c10 url('/stage/studio-cool.jpg') center/cover no-repeat",
};
