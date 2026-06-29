// Marketing copy for the public landing page, kept as plain data so it stays in
// one place (and is easy to translate to German later). No JSX here.
import {
  Dices,
  Sparkles,
  Layers,
  Flame,
  Palette,
  Clock,
  Heart,
  Users,
  Trophy,
  Moon,
  type LucideIcon,
} from "lucide-react";

export const OFFER = {
  price: "49,99 €",
  originalPrice: "199,99 €",
  discountLabel: "Launch offer · Save 75%",
  deckCount: 20,
  cardCount: "1000",
} as const;

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "20", label: "Curated decks" },
  { value: "1,000", label: "Hand-written cards" },
  { value: "EN · DE", label: "Two languages" },
  { value: "∞", label: "Lifetime access" },
];

export type Feature = { icon: LucideIcon; title: string; description: string };

export const FEATURES: Feature[] = [
  {
    icon: Dices,
    title: "Daily 3 Draw",
    description:
      "Pull one card from each of three decks every day — a small, grounding ritual that quietly becomes a habit.",
  },
  {
    icon: Sparkles,
    title: "Immersive 3D Stage",
    description:
      "Every draw unfolds on a living, cinematic stage with soft light, drifting dust and depth. It feels like a moment, not a tap.",
  },
  {
    icon: Layers,
    title: "Explore the Decks",
    description:
      "Browse all 1,000 cards across 20 decks in a fluid 3D coverflow. Wander and discover at your own pace.",
  },
  {
    icon: Flame,
    title: "Streaks & Calendar",
    description:
      "A 365-day calendar and contribution heatmap track every draw, with current and longest streaks to keep you coming back.",
  },
  {
    icon: Palette,
    title: "Studio",
    description:
      "Design your own cards — fonts, colors, backgrounds and layout — then export crisp PNGs ready to share anywhere.",
  },
  {
    icon: Clock,
    title: "Scheduled Cards",
    description:
      "Queue a card to resurface on a future day, with gentle in-app reminders so the right words find you later.",
  },
  {
    icon: Heart,
    title: "Favorites",
    description:
      "Save the cards that land and build a personal collection you can return to whenever you need them.",
  },
  {
    icon: Users,
    title: "Group Play",
    description:
      "Draw together — pass-and-play on a single device, or open a live room with a join code for up to ten people.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "Unlock milestones as your practice deepens, from your very first draw to mastering an entire deck.",
  },
  {
    icon: Moon,
    title: "Dark & Light Themes",
    description:
      "A refined dark studio by default, with a clean light mode for whenever you want it. Your space, your way.",
  },
];

// The full library — the 20 deck titles from the catalog.
export const DECKS: string[] = [
  "Clear Thinking",
  "Confidence & Self-Worth",
  "Emotional Intelligence",
  "Growth Mindset",
  "Human Stories",
  "Leadership",
  "Motivation & Self-Development",
  "Power Animals",
  "Trees",
  "Zodiac & Astrology",
  "Stoic & Discipline",
  "Impermanence & Letting Go",
  "Clarity & Calm",
  "Courage & Resilience",
  "Growth & Change",
  "The Inner Self",
  "The Quiet Mind",
  "Connection & Communication",
  "Gratitude & Enough",
  "Purpose & Humility",
];

export type Edition = { flag: string; name: string; note: string };

export const EDITIONS: Edition[] = [
  { flag: "🇬🇧", name: "English", note: "Available now" },
  { flag: "🇩🇪", name: "Deutsch", note: "Rolling out now" },
];

// Everything bundled into the one-time lifetime offer.
export const INCLUDED: string[] = [
  "All 20 decks — 1,000 hand-written cards",
  "Daily 3 draw on the immersive 3D stage",
  "Studio — design & export your own cards",
  "Calendar, streaks & achievements",
  "Scheduled reminders & favorites",
  "Group play — pass-and-play or live rooms",
  "Your choice of English or German edition",
  "Free updates, forever",
];
