// Shared configuration + lookup tables for the card-image -> R2 -> Convex pipeline.
//
// This file is the SINGLE SOURCE OF TRUTH for how on-disk image folders and vault
// Markdown map to app decks. The optimize, parse, and build scripts all import it so
// image keys, card numbers, and text always line up.
//
// Pure ESM, no env needed to import. R2 credentials are read lazily via getR2Env().

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Paths -----------------------------------------------------------------
export const PROJECT_ROOT = path.resolve(__dirname, "..");
export const OUT_DIR = path.join(PROJECT_ROOT, "out");
export const STAGING_DIR = path.join(OUT_DIR, "staging");
export const IMAGES_MANIFEST = path.join(OUT_DIR, "images-manifest.json");
export const TEXT_CATALOG = path.join(OUT_DIR, "text-catalog.json");
export const CATALOG_DATA_TS = path.join(PROJECT_ROOT, "convex", "catalogData.ts");
export const UPLOAD_LEDGER = path.join(__dirname, ".r2-uploaded.json");

// Source roots (forward slashes work fine on Windows in Node).
export const SOURCE_ROOT = "C:/Users/User/OneDrive/Desktop/Daily Card";
export const WISDOM_SOURCE_ROOT = path.join(SOURCE_ROOT, "Wisdom");
export const VAULT_ROOT =
  "C:/Users/User/OneDrive/Dokumente/Obsidian Vault/card-decks";

// ---- Helpers ---------------------------------------------------------------
export const pad2 = (n) => String(n).padStart(2, "0");

/** R2 key for a given deck slug + card number. */
export const cardKey = (deckSlug, cardNumber) =>
  `cards/${deckSlug}/${pad2(cardNumber)}.webp`;

/** R2 key for a given deck slug's cover. */
export const coverKey = (deckSlug) => `cards/${deckSlug}/cover.webp`;

/**
 * Read required R2 env vars (used by upload + build-catalog).
 * Pass the list of keys you need; throws a clear error if any are missing.
 */
export function getR2Env(required = []) {
  const env = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    publicBaseUrl: (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, ""),
  };
  const map = {
    accountId: "R2_ACCOUNT_ID",
    accessKeyId: "R2_ACCESS_KEY_ID",
    secretAccessKey: "R2_SECRET_ACCESS_KEY",
    bucket: "R2_BUCKET",
    publicBaseUrl: "R2_PUBLIC_BASE_URL",
  };
  const missing = required.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required env: ${missing.map((k) => map[k]).join(", ")}\n` +
        `Run scripts with:  node --env-file=.env.local scripts/<script>.mjs`
    );
  }
  return env;
}

// ---- Flat decks (10) -------------------------------------------------------
// sourceFolder: image folder name under SOURCE_ROOT (cards 1-en.jpg..50-en.jpg + Cover-Image.jpg)
// slug:         R2 deck slug AND vault folder name under VAULT_ROOT
// colorTheme:   MUST be one of the 6 whitelisted values (src/lib/cardTheme.ts):
//               emerald | amber | violet | rose | sky | orange
export const FLAT_DECKS = [
  {
    sourceFolder: "Clear Thinking",
    slug: "clear-thinking",
    title: "Clear Thinking",
    category: "clarity",
    colorTheme: "sky",
    description:
      "Sharper judgment, fewer blind spots — mental models and reflections to help you think clearly and decide well.",
  },
  {
    sourceFolder: "Confidence and Self Worth",
    slug: "confidence-self-worth",
    title: "Confidence & Self-Worth",
    category: "confidence",
    colorTheme: "rose",
    description:
      "Quiet, grounded confidence — daily reminders of your worth, on the good days and the hard ones.",
  },
  {
    sourceFolder: "Emotional Intelligence",
    slug: "emotional-intelligence",
    title: "Emotional Intelligence",
    category: "emotion",
    colorTheme: "violet",
    description:
      "Understand what you feel and why — cards on self-awareness, empathy, and emotional balance.",
  },
  {
    sourceFolder: "Growth Mindset",
    slug: "growth-mindset",
    title: "Growth Mindset",
    category: "growth",
    colorTheme: "emerald",
    description:
      "Stretch beyond comfort — reflections on learning, effort, and the belief that you can grow.",
  },
  {
    sourceFolder: "Human Stories",
    slug: "human-stories",
    title: "Human Stories",
    category: "stories",
    colorTheme: "orange",
    description:
      "Lessons from human lives — archetypes and stories that reveal something true about being a person.",
  },
  {
    sourceFolder: "Leadership",
    slug: "leadership",
    title: "Leadership",
    category: "leadership",
    colorTheme: "sky",
    description:
      "Lead with trust and vision — reflections on guiding people and carrying responsibility well.",
  },
  {
    sourceFolder: "Motivation and Self-Development",
    slug: "motivation-self-development",
    title: "Motivation & Self-Development",
    category: "motivation",
    colorTheme: "amber",
    description:
      "Fuel for ambition — daily nudges toward discipline, drive, and your best self.",
  },
  {
    sourceFolder: "Power Animals",
    slug: "power-animals",
    title: "Power Animals",
    category: "animals",
    colorTheme: "emerald",
    description:
      "Wisdom from the animal kingdom — each creature carries a strength to call on when you draw it.",
  },
  {
    sourceFolder: "Trees",
    slug: "trees",
    title: "Trees",
    category: "trees",
    colorTheme: "amber",
    description:
      "Rooted, patient wisdom — what trees teach us about growth, endurance, and stillness.",
  },
  {
    sourceFolder: "Zodiac and Astrology",
    slug: "zodiac-astrology",
    title: "Zodiac & Astrology",
    category: "zodiac",
    colorTheme: "violet",
    description:
      "The sky as a mirror — signs, planets, and moon phases as prompts for reflection.",
  },
];

// ---- Wisdom decks (10) -----------------------------------------------------
// Each Wisdom deck = one sub-group folder under SOURCE_ROOT/Wisdom, merging its two
// 25-card leaf themes into a single 50-card deck.
//   subGroupFolder: folder under SOURCE_ROOT/Wisdom (holds 2 leaf folders + a sub-cover)
//   leaves[]:       ORDERED — leaves[0] -> deck cards 1..25, leaves[1] -> 26..50
//     themeNum:     leading number on BOTH the image leaf folder ("1. Stoic Wisdom")
//                   and the vault file (wisdom/01-stoic-wisdom.md)
//     themeSlug:    vault file slug (wisdom/<NN>-<themeSlug>.md  +  -share.md)
export const WISDOM_DECKS = [
  {
    subGroupFolder: "1.Stoic&Discipline",
    slug: "wisdom-01-stoic-discipline",
    title: "Stoic & Discipline",
    category: "wisdom",
    colorTheme: "violet",
    description:
      "Stoic wisdom and daily discipline — control what is yours and build the habits that hold.",
    leaves: [
      { themeNum: 1, themeSlug: "stoic-wisdom" },
      { themeNum: 4, themeSlug: "discipline-habits" },
    ],
  },
  {
    subGroupFolder: "2.Impermanence&Letting Go",
    slug: "wisdom-02-impermanence-letting-go",
    title: "Impermanence & Letting Go",
    category: "wisdom",
    colorTheme: "sky",
    description:
      "Time, mortality, and the art of letting go — hold life gently.",
    leaves: [
      { themeNum: 2, themeSlug: "time-mortality" },
      { themeNum: 3, themeSlug: "letting-go" },
    ],
  },
  {
    subGroupFolder: "3.Clarity&Calm",
    slug: "wisdom-03-clarity-calm",
    title: "Clarity & Calm",
    category: "wisdom",
    colorTheme: "emerald",
    description:
      "Focus, simplicity, and inner peace — clear the noise and come back to calm.",
    leaves: [
      { themeNum: 5, themeSlug: "focus-simplicity" },
      { themeNum: 20, themeSlug: "inner-peace" },
    ],
  },
  {
    subGroupFolder: "4.Courage&Resilience",
    slug: "wisdom-04-courage-resilience",
    title: "Courage & Resilience",
    category: "wisdom",
    colorTheme: "rose",
    description:
      "Fear, courage, and resilience — meet hardship and keep standing.",
    leaves: [
      { themeNum: 6, themeSlug: "fear-courage" },
      { themeNum: 17, themeSlug: "adversity-resilience" },
    ],
  },
  {
    subGroupFolder: "5.Growth&Change",
    slug: "wisdom-05-growth-change",
    title: "Growth & Change",
    category: "wisdom",
    colorTheme: "amber",
    description:
      "Failure, growth, and change — become through what you go through.",
    leaves: [
      { themeNum: 7, themeSlug: "failure-growth" },
      { themeNum: 19, themeSlug: "change-uncertainty" },
    ],
  },
  {
    subGroupFolder: "6.The Inner Self",
    slug: "wisdom-06-inner-self",
    title: "The Inner Self",
    category: "wisdom",
    colorTheme: "orange",
    description:
      "Self-knowledge and emotions — turn inward and meet yourself honestly.",
    leaves: [
      { themeNum: 8, themeSlug: "self-knowledge" },
      { themeNum: 13, themeSlug: "emotions" },
    ],
  },
  {
    subGroupFolder: "7.The Quiet Mind",
    slug: "wisdom-07-quiet-mind",
    title: "The Quiet Mind",
    category: "wisdom",
    colorTheme: "violet",
    description:
      "Solitude, silence, and a steadier mind — quiet the thoughts and listen.",
    leaves: [
      { themeNum: 10, themeSlug: "solitude-silence" },
      { themeNum: 12, themeSlug: "mind-thoughts" },
    ],
  },
  {
    subGroupFolder: "8.Connection & Communication",
    slug: "wisdom-08-connection-communication",
    title: "Connection & Communication",
    category: "wisdom",
    colorTheme: "sky",
    description:
      "Relationships, speech, and listening — the wisdom of being with others.",
    leaves: [
      { themeNum: 9, themeSlug: "relationships" },
      { themeNum: 16, themeSlug: "speech-listening" },
    ],
  },
  {
    subGroupFolder: "9.Gratitude & Enough",
    slug: "wisdom-09-gratitude-enough",
    title: "Gratitude & Enough",
    category: "wisdom",
    colorTheme: "emerald",
    description:
      "Gratitude, contentment, and enough — wanting what you already have.",
    leaves: [
      { themeNum: 11, themeSlug: "gratitude-contentment" },
      { themeNum: 14, themeSlug: "money-enough" },
    ],
  },
  {
    subGroupFolder: "10.Purpose and Humility",
    slug: "wisdom-10-purpose-humility",
    title: "Purpose & Humility",
    category: "wisdom",
    colorTheme: "amber",
    description:
      "Work, purpose, and humility — meaningful effort without ego.",
    leaves: [
      { themeNum: 15, themeSlug: "work-purpose" },
      { themeNum: 18, themeSlug: "humility-ego" },
    ],
  },
];

export const WISDOM_LEAF_SIZE = 25; // cards per leaf theme
export const EXPECTED_DECKS = FLAT_DECKS.length + WISDOM_DECKS.length; // 20
export const EXPECTED_CARDS =
  FLAT_DECKS.length * 50 + WISDOM_DECKS.length * 2 * WISDOM_LEAF_SIZE; // 1000
