// Marketing copy for the public landing page, kept as plain data so it stays in
// one place (and is easy to translate to German later). No JSX here.
import { Dices, Layers, Users, type LucideIcon } from "lucide-react";
import type { ThemeKey } from "@/lib/cardTheme";

export const OFFER = {
  // Single-edition lifetime price (English or German).
  price: "79,99 €",
  originalPrice: "199,99 €",
  discountLabel: "Launch offer · Save 60%",
  // Both-editions bundle (English + German). Anchored against buying the two
  // single editions separately (2 × 79,99 = 159,98), so the saving is honest.
  bundlePrice: "99,99 €",
  bundleOriginalPrice: "159,98 €",
  bundleLabel: "Both editions · Best value",
  deckCount: 20,
  cardCount: "1000",
} as const;

// Deck cover art lives on Cloudflare R2 (English edition). The covers are stable
// public objects, so we reference them directly here rather than fetching the
// catalog from Convex, the marketing page then renders instantly with no async
// flash for logged-out visitors. Portrait 3:4 .webp.
export const R2_BASE = "https://pub-e607b282e9b742b19c9277f92df86c0b.r2.dev";
export const coverUrl = (slug: string) => `${R2_BASE}/cards/${slug}/cover.webp`;

export type DeckCover = { slug: string; title: string; theme: ThemeKey };

// The full library: every deck paired with its catalog slug and color theme
// (themes match convex/catalogData.ts, used for the matching cover glow).
export const DECK_COVERS: DeckCover[] = [
  { slug: "clear-thinking", title: "Clear Thinking", theme: "sky" },
  { slug: "confidence-self-worth", title: "Confidence & Self-Worth", theme: "rose" },
  { slug: "emotional-intelligence", title: "Emotional Intelligence", theme: "violet" },
  { slug: "growth-mindset", title: "Growth Mindset", theme: "emerald" },
  { slug: "human-stories", title: "Human Stories", theme: "orange" },
  { slug: "leadership", title: "Leadership", theme: "sky" },
  { slug: "motivation-self-development", title: "Motivation & Self-Development", theme: "amber" },
  { slug: "power-animals", title: "Power Animals", theme: "emerald" },
  { slug: "trees", title: "Trees", theme: "amber" },
  { slug: "zodiac-astrology", title: "Zodiac & Astrology", theme: "violet" },
  { slug: "wisdom-01-stoic-discipline", title: "Stoic & Discipline", theme: "violet" },
  { slug: "wisdom-02-impermanence-letting-go", title: "Impermanence & Letting Go", theme: "sky" },
  { slug: "wisdom-03-clarity-calm", title: "Clarity & Calm", theme: "emerald" },
  { slug: "wisdom-04-courage-resilience", title: "Courage & Resilience", theme: "rose" },
  { slug: "wisdom-05-growth-change", title: "Growth & Change", theme: "amber" },
  { slug: "wisdom-06-inner-self", title: "The Inner Self", theme: "orange" },
  { slug: "wisdom-07-quiet-mind", title: "The Quiet Mind", theme: "violet" },
  { slug: "wisdom-08-connection-communication", title: "Connection & Communication", theme: "sky" },
  { slug: "wisdom-09-gratitude-enough", title: "Gratitude & Enough", theme: "emerald" },
  { slug: "wisdom-10-purpose-humility", title: "Purpose & Humility", theme: "amber" },
];

// A curated, color-balanced subset for the hero card fan: one cover per accent
// hue (emerald · rose · violet · amber · sky · orange), ordered for the arc.
export const HERO_COVERS: DeckCover[] = [
  { slug: "trees", title: "Trees", theme: "amber" },
  { slug: "wisdom-04-courage-resilience", title: "Courage & Resilience", theme: "rose" },
  { slug: "power-animals", title: "Power Animals", theme: "emerald" },
  { slug: "zodiac-astrology", title: "Zodiac & Astrology", theme: "violet" },
  { slug: "clear-thinking", title: "Clear Thinking", theme: "sky" },
  { slug: "human-stories", title: "Human Stories", theme: "orange" },
];

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "20", label: "Curated decks" },
  { value: "1,000", label: "Hand-written cards" },
  { value: "EN · DE", label: "Two languages" },
  { value: "∞", label: "Lifetime access" },
];

export type Feature = {
  icon: LucideIcon;
  theme: ThemeKey;
  title: string;
  description: string;
};

// The three headline features. The rest of what's included is enumerated in the
// pricing section's checklist (INCLUDED).
export const FEATURES: Feature[] = [
  {
    icon: Dices,
    theme: "amber",
    title: "Daily 3 Draw",
    description:
      "Pull one card from each of three decks every day, a small grounding ritual that quietly becomes a habit.",
  },
  {
    icon: Layers,
    theme: "sky",
    title: "Explore the Decks",
    description:
      "Browse all 1,000 cards across 20 decks in a fluid coverflow. Wander and discover at your own pace.",
  },
  {
    icon: Users,
    theme: "violet",
    title: "Group Play",
    description:
      "Draw together. Pass-and-play on a single device, or open a live room with a join code for up to ten people.",
  },
];

// "both" is the bundle SKU (English + German), not a language. It lives in the
// same union so the chosen plan can persist to localStorage for checkout.
export type EditionCode = "en" | "de" | "both";
export type Edition = {
  code: EditionCode;
  flag: string;
  name: string;
  note: string;
};

export const EDITIONS: Edition[] = [
  { code: "en", flag: "🇬🇧", name: "English", note: "Available now · 1,000 cards" },
  { code: "de", flag: "🇩🇪", name: "Deutsch", note: "Available now · 1,700 cards" },
];

// Optional upsell: both language editions in one purchase. Kept out of EDITIONS
// so the language chooser still shows just the two single editions; the pricing
// card composes PURCHASE_OPTIONS (= EDITIONS + bundle) for its plan picker.
export const BUNDLE: Edition = {
  code: "both",
  flag: "🇬🇧🇩🇪",
  name: "Both",
  note: "English + German · 2,700 cards",
};

export const PURCHASE_OPTIONS: Edition[] = [...EDITIONS, BUNDLE];

// Everything bundled into the one-time lifetime offer.
export const INCLUDED: string[] = [
  "All 20 decks and 1,000 hand-written cards",
  "Daily 3 draw to start every morning",
  "Studio to design and export your own cards",
  "Calendar and streaks to track your practice",
  "Scheduled cards and saved favorites",
  "Group play, pass-and-play or live rooms",
  "Your choice of English or German edition",
  "Free updates, forever",
];
