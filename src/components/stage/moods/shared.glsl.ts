// Shared GLSL building blocks for the mood fragment shaders.

/**
 * Fullscreen vertex shader. The stage renders a 2x2 plane whose clip-space
 * position is passed through directly (no projection), so it always fills the
 * viewport regardless of the camera. `vUv` runs 0..1 across the screen.
 */
export const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Standard uniform + varying declarations every mood fragment shader uses.
 * (three.js injects the float precision automatically, so it's omitted here.)
 */
export const FRAG_HEADER = /* glsl */ `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  varying vec2  vUv;
`;

/**
 * Value-noise + fbm helpers. Prepend to a fragment shader (before main) to use
 * `fbm(vec2)` / `noise(vec2)`. Cheap 2D noise — good for nebulae, fog, fluid
 * gradients; no raymarching.
 */
export const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  // Aspect-correct, centered coordinates from vUv.
  vec2 centered(vec2 uv, vec2 res) {
    vec2 p = uv - 0.5;
    p.x *= res.x / res.y;
    return p;
  }
`;
