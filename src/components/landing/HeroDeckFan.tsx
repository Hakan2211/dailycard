import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { getCardBackHex, getCardTheme } from "@/lib/cardTheme";
import { HERO_COVERS, coverUrl } from "./content";

// Three float speeds, cycled across the cards so neighbours drift out of sync
// (looks organic rather than a single synchronized bob).
const FLOAT_CLASSES = [
  "animate-float-y-slow",
  "animate-float-y",
  "animate-float-y-fast",
];

/**
 * The hero centerpiece: a fanned hand of real deck covers that fans out on load,
 * drifts gently, and leans toward the cursor. Covers carry the colour; each sits
 * over a glow tinted to its own deck theme. Fully responsive (measures its own
 * width) and collapses to a static fan under prefers-reduced-motion.
 */
export function HeroDeckFan() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560); // sane SSR/first-paint default

  // Measure the container so the fan spread + card size scale fluidly.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pointer parallax (subtle lean toward the cursor + a touch of 3D tilt).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const tx = useTransform(sx, [-0.5, 0.5], [-26, 26]);
  const ty = useTransform(sy, [-0.5, 0.5], [-14, 14]);
  const ry = useTransform(sx, [-0.5, 0.5], [7, -7]);
  const rx = useTransform(sy, [-0.5, 0.5], [-5, 5]);

  const n = HERO_COVERS.length;
  const unit = Math.min(84, Math.max(44, width / 7.5));
  const cardW = Math.round(unit * 1.85);

  const handleMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const resetMove = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={resetMove}
      className="relative mx-auto h-[230px] w-full max-w-[600px] [perspective:1200px] sm:h-[320px] lg:h-[360px]"
      aria-hidden
    >
      {/* Soft warm glow pooled behind the whole fan. */}
      <div
        className="animate-glow-pulse pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(186,160,255,0.20), rgba(120,180,255,0.10), transparent 80%)",
        }}
      />

      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        style={reduce ? undefined : { x: tx, y: ty, rotateX: rx, rotateY: ry }}
      >
        {HERO_COVERS.map((deck, i) => {
          const offset = i - (n - 1) / 2; // e.g. -2.5 … 2.5
          const fx = offset * unit;
          const fy = offset * offset * unit * 0.16;
          const rot = offset * 6.5;
          const scale = 1 - Math.abs(offset) * 0.035;
          const zIndex = 20 - Math.round(Math.abs(offset) * 2);
          const hex = getCardBackHex(deck.theme);
          const floatClass = FLOAT_CLASSES[i % FLOAT_CLASSES.length];

          return (
            <div
              key={deck.slug}
              className="absolute left-1/2 top-2"
              style={{ width: cardW, marginLeft: -cardW / 2, zIndex }}
            >
              <motion.div
                initial={
                  reduce
                    ? false
                    : { x: 0, y: 0, rotate: 0, scale: 0.7, opacity: 0 }
                }
                animate={{ x: fx, y: fy, rotate: rot, scale, opacity: 1 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className={reduce ? undefined : floatClass}
                  style={reduce ? undefined : { animationDelay: `${i * 0.4}s` }}
                >
                  {/* Deck-tinted glow behind the cover. */}
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 rounded-3xl blur-xl"
                    style={{
                      background: `radial-gradient(closest-side, ${hex.from}55, transparent 75%)`,
                    }}
                  />
                  <div
                    className={`overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl ring-1 ring-white/10 ${getCardTheme(deck.theme).glow}`}
                  >
                    <img
                      src={coverUrl(deck.slug)}
                      alt={deck.title}
                      draggable={false}
                      loading="eager"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
