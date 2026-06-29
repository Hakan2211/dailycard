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
/** Per-language images manifest path (EN keeps the original filename, DE is namespaced). */
export const imagesManifestPath = (lang = "en") =>
  lang === "de" ? path.join(OUT_DIR, "images-manifest.de.json") : IMAGES_MANIFEST;
export const TEXT_CATALOG = path.join(OUT_DIR, "text-catalog.json");
export const CATALOG_DATA_TS = path.join(PROJECT_ROOT, "convex", "catalogData.ts");
export const UPLOAD_LEDGER = path.join(__dirname, ".r2-uploaded.json");

// Source roots (forward slashes work fine on Windows in Node).
export const SOURCE_ROOT = "C:/Users/User/OneDrive/Desktop/Daily Card";
export const WISDOM_SOURCE_ROOT = path.join(SOURCE_ROOT, "Wisdom");
// German edition source roots (the German set lives under a subfolder of SOURCE_ROOT).
export const GERMAN_SOURCE_ROOT = path.join(SOURCE_ROOT, "German Versions");
export const GERMAN_WISDOM_SOURCE_ROOT = path.join(GERMAN_SOURCE_ROOT, "Weisheiten");
export const VAULT_ROOT =
  "C:/Users/User/OneDrive/Dokumente/Obsidian Vault/card-decks";

// ---- Helpers ---------------------------------------------------------------
export const pad2 = (n) => String(n).padStart(2, "0");

/** R2 key for a given deck slug + card number. `prefix` namespaces a language (e.g. "de/"). */
export const cardKey = (deckSlug, cardNumber, prefix = "") =>
  `${prefix}cards/${deckSlug}/${pad2(cardNumber)}.webp`;

/** R2 key for a given deck slug's cover. `prefix` namespaces a language (e.g. "de/"). */
export const coverKey = (deckSlug, prefix = "") => `${prefix}cards/${deckSlug}/cover.webp`;

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
    sourceFolderDe: "Klares Denken",
    slug: "clear-thinking",
    title: "Clear Thinking",
    category: "clarity",
    colorTheme: "sky",
    description:
      "Sharper judgment, fewer blind spots — mental models and reflections to help you think clearly and decide well.",
  },
  {
    sourceFolder: "Confidence and Self Worth",
    sourceFolderDe: "Selbstvertrauen und Selbstwert",
    slug: "confidence-self-worth",
    title: "Confidence & Self-Worth",
    category: "confidence",
    colorTheme: "rose",
    description:
      "Quiet, grounded confidence — daily reminders of your worth, on the good days and the hard ones.",
  },
  {
    sourceFolder: "Emotional Intelligence",
    sourceFolderDe: "Emotionale Intelligenz",
    slug: "emotional-intelligence",
    title: "Emotional Intelligence",
    category: "emotion",
    colorTheme: "violet",
    description:
      "Understand what you feel and why — cards on self-awareness, empathy, and emotional balance.",
  },
  {
    sourceFolder: "Growth Mindset",
    sourceFolderDe: "Wachstumsdenken",
    slug: "growth-mindset",
    title: "Growth Mindset",
    category: "growth",
    colorTheme: "emerald",
    description:
      "Stretch beyond comfort — reflections on learning, effort, and the belief that you can grow.",
  },
  {
    sourceFolder: "Human Stories",
    sourceFolderDe: "Menschentypen",
    slug: "human-stories",
    title: "Human Stories",
    category: "stories",
    colorTheme: "orange",
    description:
      "Lessons from human lives — archetypes and stories that reveal something true about being a person.",
  },
  {
    sourceFolder: "Leadership",
    sourceFolderDe: "Führung",
    slug: "leadership",
    title: "Leadership",
    category: "leadership",
    colorTheme: "sky",
    description:
      "Lead with trust and vision — reflections on guiding people and carrying responsibility well.",
  },
  {
    sourceFolder: "Motivation and Self-Development",
    sourceFolderDe: "Motivation",
    slug: "motivation-self-development",
    title: "Motivation & Self-Development",
    category: "motivation",
    colorTheme: "amber",
    description:
      "Fuel for ambition — daily nudges toward discipline, drive, and your best self.",
  },
  {
    sourceFolder: "Power Animals",
    sourceFolderDe: "Krafttiere",
    slug: "power-animals",
    title: "Power Animals",
    category: "animals",
    colorTheme: "emerald",
    description:
      "Wisdom from the animal kingdom — each creature carries a strength to call on when you draw it.",
  },
  {
    sourceFolder: "Trees",
    sourceFolderDe: "Bäume",
    slug: "trees",
    title: "Trees",
    category: "trees",
    colorTheme: "amber",
    description:
      "Rooted, patient wisdom — what trees teach us about growth, endurance, and stillness.",
  },
  {
    sourceFolder: "Zodiac and Astrology",
    sourceFolderDe: "Tierkreis und Astrologie",
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
    germanWisdomFolder: "Stoiker und Disziplin",
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
    germanWisdomFolder: "Vergänglichkeit und Loslassen",
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
    germanWisdomFolder: "Klarheit und Ruhe",
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
    germanWisdomFolder: "Mut und Widerstandskraft",
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
    germanWisdomFolder: "Wachstum und Wandel",
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
    germanWisdomFolder: "Das innere Selbst",
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
    germanWisdomFolder: "Der stille Geist",
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
    germanWisdomFolder: "Verbindung und Kommunikation",
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
    germanWisdomFolder: "Dankbarkeit und Genug",
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
    germanWisdomFolder: "Sinn und Demut",
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

// ---- German-only decks (13) ------------------------------------------------
// These exist ONLY in the German edition today (the "extra 650"). slug +
// sourceFolderDe are load-bearing for the `--lang de` optimize pass; the
// title/category/colorTheme/description are filled in now so they're ready for
// the bilingual runtime phase. colorTheme MUST be one of the 6 whitelisted
// values (src/lib/cardTheme.ts). sourceFolderDe MUST match the literal on-disk
// folder name under GERMAN_SOURCE_ROOT (note "Philosopie" is misspelled on disk).
export const GERMAN_ONLY_DECKS = [
  {
    slug: "mindfulness-presence",
    sourceFolderDe: "Achtsamkeit & Präsenz",
    title: "Achtsamkeit & Präsenz",
    category: "mindfulness",
    colorTheme: "sky",
    description:
      "Im Hier und Jetzt ankommen — Impulse für mehr Achtsamkeit und Präsenz im Alltag.",
  },
  {
    slug: "relationships-love",
    sourceFolderDe: "Beziehungen, Freundschaft & Liebe",
    title: "Beziehungen, Freundschaft & Liebe",
    category: "relationships",
    colorTheme: "rose",
    description:
      "Nähe, Vertrauen und echte Verbindung — Reflexionen über Beziehungen, Freundschaft und Liebe.",
  },
  {
    slug: "cognitive-biases",
    sourceFolderDe: "Denkfehler - Kognitive Verzerrungen",
    title: "Denkfehler & Kognitive Verzerrungen",
    category: "clarity",
    colorTheme: "sky",
    description:
      "Die blinden Flecken des Denkens erkennen — kognitive Verzerrungen und wie du klarer urteilst.",
  },
  {
    slug: "focus-deep-work",
    sourceFolderDe: "Fokus und Konzentriertes Arbeiten",
    title: "Fokus & Konzentriertes Arbeiten",
    category: "focus",
    colorTheme: "violet",
    description:
      "Tiefe statt Ablenkung — Impulse für Fokus, Konzentration und konzentriertes Arbeiten.",
  },
  {
    slug: "money-mindset",
    sourceFolderDe: "Geld-Mindset",
    title: "Geld-Mindset",
    category: "money",
    colorTheme: "amber",
    description:
      "Ein gesundes Verhältnis zu Geld — Glaubenssätze und Reflexionen rund um dein Geld-Mindset.",
  },
  {
    slug: "habits-discipline",
    sourceFolderDe: "Gewohnheiten und Disziplin",
    title: "Gewohnheiten & Disziplin",
    category: "habits",
    colorTheme: "emerald",
    description:
      "Kleine Schritte, große Wirkung — Gewohnheiten und Disziplin, die wirklich tragen.",
  },
  {
    slug: "happiness-wellbeing",
    sourceFolderDe: "Glück und Wohlbefinden",
    title: "Glück & Wohlbefinden",
    category: "wellbeing",
    colorTheme: "orange",
    description:
      "Was wirklich erfüllt — Reflexionen über Glück, Zufriedenheit und Wohlbefinden.",
  },
  {
    slug: "courage-over-fear",
    sourceFolderDe: "Mut über Angst",
    title: "Mut über Angst",
    category: "courage",
    colorTheme: "rose",
    description:
      "Der Angst begegnen und trotzdem handeln — tägliche Erinnerungen an deinen Mut.",
  },
  {
    slug: "philosophy",
    sourceFolderDe: "Philosopie",
    title: "Philosophie",
    category: "philosophy",
    colorTheme: "violet",
    description:
      "Die großen Fragen — philosophische Gedanken für ein bewussteres Leben.",
  },
  {
    slug: "behavioral-psychology",
    sourceFolderDe: "Psychologie des Verhaltens",
    title: "Psychologie des Verhaltens",
    category: "psychology",
    colorTheme: "sky",
    description:
      "Warum wir tun, was wir tun — Einblicke in die Psychologie des Verhaltens.",
  },
  {
    slug: "self-compassion",
    sourceFolderDe: "Selbstmitgefühl",
    title: "Selbstmitgefühl",
    category: "self-compassion",
    colorTheme: "rose",
    description:
      "Freundlich mit dir selbst sein — Impulse für mehr Selbstmitgefühl, gerade an schweren Tagen.",
  },
  {
    slug: "meaning-purpose",
    sourceFolderDe: "Sinn und Bedeutung",
    title: "Sinn & Bedeutung",
    category: "meaning",
    colorTheme: "amber",
    description:
      "Wofür es sich zu leben lohnt — Reflexionen über Sinn und Bedeutung.",
  },
  {
    slug: "time-impermanence",
    sourceFolderDe: "Zeit und Vergänglichkeit",
    title: "Zeit & Vergänglichkeit",
    category: "wisdom",
    colorTheme: "sky",
    description:
      "Die Zeit ist begrenzt — Gedanken über Vergänglichkeit und das, was wirklich zählt.",
  },
];

/**
 * Flattened list of all 33 German decks for the `--lang de` optimize pass.
 * Every German deck is a FLAT 50-card folder (`1-de.jpg`..`50-de.jpg` + a cover),
 * including the Weisheiten sub-decks — they are delivered pre-merged, so the
 * English two-leaf merge path is never used for German.
 * Returns: { slug, folder, root }
 */
export function germanDecks() {
  const shared = FLAT_DECKS.filter((d) => d.sourceFolderDe).map((d) => ({
    slug: d.slug,
    folder: d.sourceFolderDe,
    root: GERMAN_SOURCE_ROOT,
  }));
  const onlyDe = GERMAN_ONLY_DECKS.map((d) => ({
    slug: d.slug,
    folder: d.sourceFolderDe,
    root: GERMAN_SOURCE_ROOT,
  }));
  const wisdom = WISDOM_DECKS.map((d) => ({
    slug: d.slug,
    folder: d.germanWisdomFolder,
    root: GERMAN_WISDOM_SOURCE_ROOT,
  }));
  return [...shared, ...onlyDe, ...wisdom];
}

export const EXPECTED_DECKS_DE =
  FLAT_DECKS.filter((d) => d.sourceFolderDe).length +
  GERMAN_ONLY_DECKS.length +
  WISDOM_DECKS.length; // 33
export const EXPECTED_CARDS_DE = EXPECTED_DECKS_DE * 50; // 1650
