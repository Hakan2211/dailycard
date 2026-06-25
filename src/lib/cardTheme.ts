// Canonical card/deck color themes.
//
// IMPORTANT: every value here must be a COMPLETE, literal Tailwind class string.
// Never build them dynamically (e.g. `bg-${color}-500`) or Tailwind v4's scanner
// will purge them from the production build.

export type ThemeKey =
  | "emerald"
  | "amber"
  | "violet"
  | "rose"
  | "sky"
  | "orange";

export interface CardThemeVariant {
  /** Soft surface background, e.g. card tint */
  bg: string;
  /** Accent text color */
  text: string;
  /** Accent border color */
  border: string;
  /** Button/header gradient (from/to) */
  gradient: string;
  /** Badge background + text */
  badge: string;
  /** Colored shadow glow */
  glow: string;
  /** Card-back gradient (darker, from/to) */
  cardBg: string;
  /** Solid dot / swatch color */
  dot: string;
}

export const cardTheme: Record<ThemeKey, CardThemeVariant> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-700",
    badge: "border border-emerald-400/25 bg-emerald-500/15 text-emerald-200",
    glow: "shadow-emerald-500/25",
    cardBg: "from-emerald-600 to-emerald-900",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-700",
    badge: "border border-amber-400/25 bg-amber-500/15 text-amber-200",
    glow: "shadow-amber-500/25",
    cardBg: "from-amber-600 to-amber-900",
    dot: "bg-amber-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    gradient: "from-violet-500 to-violet-700",
    badge: "border border-violet-400/25 bg-violet-500/15 text-violet-200",
    glow: "shadow-violet-500/25",
    cardBg: "from-violet-600 to-violet-900",
    dot: "bg-violet-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    gradient: "from-rose-500 to-rose-700",
    badge: "border border-rose-400/25 bg-rose-500/15 text-rose-200",
    glow: "shadow-rose-500/25",
    cardBg: "from-rose-600 to-rose-900",
    dot: "bg-rose-500",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    gradient: "from-sky-500 to-sky-700",
    badge: "border border-sky-400/25 bg-sky-500/15 text-sky-200",
    glow: "shadow-sky-500/25",
    cardBg: "from-sky-600 to-sky-900",
    dot: "bg-sky-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    gradient: "from-orange-500 to-orange-700",
    badge: "border border-orange-400/25 bg-orange-500/15 text-orange-200",
    glow: "shadow-orange-500/25",
    cardBg: "from-orange-600 to-orange-900",
    dot: "bg-orange-500",
  },
};

/** Resolve a deck.colorTheme string to a theme, falling back to emerald. */
export function getCardTheme(key: string | undefined): CardThemeVariant {
  return cardTheme[(key ?? "") as ThemeKey] ?? cardTheme.emerald;
}

// Raw hex for the card-back gradient (Tailwind 600 -> 900), used when drawing
// the card back onto a 2D canvas for the 3D texture (canvas needs hex, not classes).
export const cardBackHex: Record<ThemeKey, { from: string; to: string }> = {
  emerald: { from: "#059669", to: "#064e3b" },
  amber: { from: "#d97706", to: "#78350f" },
  violet: { from: "#7c3aed", to: "#4c1d95" },
  rose: { from: "#e11d48", to: "#881337" },
  sky: { from: "#0284c7", to: "#0c4a6e" },
  orange: { from: "#ea580c", to: "#7c2d12" },
};

export function getCardBackHex(key: string | undefined): {
  from: string;
  to: string;
} {
  return cardBackHex[(key ?? "") as ThemeKey] ?? cardBackHex.emerald;
}

/** Options for color-theme pickers (admin, studio). */
export const COLOR_THEMES: Array<{
  value: ThemeKey;
  label: string;
  dot: string;
}> = [
  { value: "emerald", label: "Emerald (Green)", dot: "bg-emerald-500" },
  { value: "amber", label: "Amber (Gold)", dot: "bg-amber-500" },
  { value: "violet", label: "Violet (Purple)", dot: "bg-violet-500" },
  { value: "rose", label: "Rose (Pink)", dot: "bg-rose-500" },
  { value: "sky", label: "Sky (Blue)", dot: "bg-sky-500" },
  { value: "orange", label: "Orange", dot: "bg-orange-500" },
];
