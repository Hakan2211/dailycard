// Merge the image manifest + parsed text into a typed Convex catalog module.
//
//   node --env-file=.env.local scripts/build-catalog.mjs            # English
//   node --env-file=.env.local scripts/build-catalog.mjs --lang de  # German
//
// Needs R2_PUBLIC_BASE_URL (to bake absolute image URLs). Images are the source of
// truth for which cards exist. English enriches them with vault text; German has no
// text data (it is baked into the card images), so German cards ship image-first.
// Emits a typed TS module the Convex importer imports directly (no CLI arg passing).

import fs from "node:fs";
import path from "node:path";
import {
  IMAGES_MANIFEST,
  TEXT_CATALOG,
  TEXT_CATALOG_DE,
  CATALOG_DATA_TS,
  PROJECT_ROOT,
  imagesManifestPath,
  FLAT_DECKS,
  WISDOM_DECKS,
  germanCatalogDecks,
  EXPECTED_DECKS,
  EXPECTED_CARDS,
  EXPECTED_DECKS_DE,
  EXPECTED_CARDS_DE,
  getR2Env,
} from "./config.mjs";

const lang = process.argv.includes("--lang")
  ? process.argv[process.argv.indexOf("--lang") + 1]
  : "en";
if (lang !== "en" && lang !== "de") {
  throw new Error(`Unsupported --lang "${lang}" (expected "en" or "de")`);
}

const { publicBaseUrl } = getR2Env(["publicBaseUrl"]);

function firstSentence(s) {
  if (!s) return "";
  const m = s.match(/^.*?[.!?](\s|$)/);
  const out = (m ? m[0] : s).trim();
  return out.length > 140 ? out.slice(0, 137).trimEnd() + "…" : out;
}

// House rule: no em/en-dashes in card text. The vault keeps the dashes (they match
// the text baked into the German images); we rewrite them for the app copy only.
// The 10 affected headlines below are German-only deck headlines rewritten
// context-aware (comma/colon/period). Keyed by `slug:cardNumber` so it does not
// depend on exact-string matching of the source.
const DE_HEADLINE_FIX = {
  "habits-discipline:1": "Kleine Gewohnheiten addieren sich nicht, sie potenzieren sich.",
  "habits-discipline:5": "Du steigst nicht zu deinen Zielen auf, du fällst auf deine Gewohnheiten zurück.",
  "habits-discipline:18": "Du brauchst nicht mehr Ziele, du brauchst ein besseres System.",
  "habits-discipline:30": "Bambus wächst jahrelang im Stillen, dann schießt er in den Himmel.",
  "habits-discipline:36": "Schlechte Gewohnheiten lassen sich leicht ignorieren, bis es nicht mehr geht.",
  "habits-discipline:47": "Gestalte deine Standards, du wirst nach ihnen leben.",
  "courage-over-fear:21": "Schiffe sind im Hafen sicher, doch dafür sind sie nicht gebaut.",
  "courage-over-fear:29": "Stich in See: zerbrechlich, aber mutig.",
  "philosophy:6": "Bedenke, dass du sterben wirst, also lebe wirklich.",
  "philosophy:14": "Tausch jede Planke aus. Bist du noch du?",
};

// Generic fallback: replace any leftover em/en-dash with a comma and warn so the
// occurrence gets a proper hand-written fix.
function stripDashes(s, warnings, where) {
  if (!s || !/[—–]/.test(s)) return s;
  warnings.push(`[${where}] em/en-dash auto-replaced with comma: "${s}"`);
  return s.replace(/\s*[—–]\s*/g, ", ");
}

// ---- English: join image manifest + vault text ----------------------------
function buildEnglish(manifestBySlug) {
  if (!fs.existsSync(TEXT_CATALOG))
    throw new Error(`Missing ${TEXT_CATALOG} — run parse-markdown.mjs first`);
  const text = JSON.parse(fs.readFileSync(TEXT_CATALOG, "utf8"));
  const warnings = [];
  const decks = [];

  for (const cfg of [...FLAT_DECKS, ...WISDOM_DECKS]) {
    const m = manifestBySlug.get(cfg.slug);
    if (!m || m.cards.length === 0) {
      warnings.push(`[${cfg.slug}] no images in manifest — deck skipped`);
      continue;
    }
    const textCards = text[cfg.slug]?.cards ?? {};

    const cards = [...m.cards]
      .sort((a, b) => a.cardNumber - b.cardNumber)
      .map(({ cardNumber, key }) => {
        const t = textCards[cardNumber];
        if (!t) warnings.push(`[${cfg.slug}] card #${cardNumber} has image but no text`);
        const enHeadline = t?.enHeadline?.trim();
        const enTitle = t?.enTitle?.trim();
        const quote = enHeadline || enTitle || `Card ${cardNumber}`;
        const description = enTitle || firstSentence(t?.storyEn) || quote;
        const card = { imageUrl: `${publicBaseUrl}/${key}`, quote, description, cardNumber };
        if (t?.storyEn) card.story = t.storyEn;
        if (t?.captionEn) card.caption = t.captionEn;
        return card;
      });

    const imageNums = new Set(m.cards.map((c) => c.cardNumber));
    for (const n of Object.keys(textCards)) {
      if (!imageNums.has(Number(n)))
        warnings.push(`[${cfg.slug}] card #${n} has text but no image (dropped)`);
    }

    decks.push({
      slug: cfg.slug,
      title: cfg.title,
      description: cfg.description,
      coverImageUrl: m.coverKey ? `${publicBaseUrl}/${m.coverKey}` : "",
      category: cfg.category,
      colorTheme: cfg.colorTheme,
      isActive: true,
      totalCards: cards.length,
      cards,
    });
    if (!m.coverKey) warnings.push(`[${cfg.slug}] no cover image (coverImageUrl empty)`);
  }
  return { decks, warnings };
}

// ---- German: join image manifest + parsed German vault text ----------------
// The German card text (headline/title for all decks; story/caption for the
// shared + wisdom decks and authored for the German-only decks) lives in
// out/text-catalog.de.json. The DE headline is the exact text baked into the
// German image, so it lines up by deck slug + card number.
function buildGerman(manifestBySlug) {
  if (!fs.existsSync(TEXT_CATALOG_DE))
    throw new Error(`Missing ${TEXT_CATALOG_DE} — run parse-markdown.mjs first`);
  const text = JSON.parse(fs.readFileSync(TEXT_CATALOG_DE, "utf8"));
  const warnings = [];
  const decks = [];

  for (const cfg of germanCatalogDecks()) {
    const m = manifestBySlug.get(cfg.slug);
    if (!m || m.cards.length === 0) {
      warnings.push(`[${cfg.slug}] no images in DE manifest — deck skipped`);
      continue;
    }
    const textCards = text[cfg.slug]?.cards ?? {};

    const cards = [...m.cards]
      .sort((a, b) => a.cardNumber - b.cardNumber)
      .map(({ cardNumber, key }) => {
        const t = textCards[cardNumber];
        if (!t) warnings.push(`[${cfg.slug}] card #${cardNumber} has image but no DE text`);
        const deHeadline = t?.deHeadline?.trim();
        const deTitle = t?.deTitle?.trim();
        const rawQuote = DE_HEADLINE_FIX[`${cfg.slug}:${cardNumber}`] || deHeadline || deTitle || "";
        const quote = stripDashes(rawQuote, warnings, `${cfg.slug} #${cardNumber} quote`);
        const description = stripDashes(
          deTitle || firstSentence(t?.storyDe) || quote,
          warnings,
          `${cfg.slug} #${cardNumber} description`
        );
        const card = { imageUrl: `${publicBaseUrl}/${key}`, quote, description, cardNumber };
        if (t?.storyDe) card.story = stripDashes(t.storyDe, warnings, `${cfg.slug} #${cardNumber} story`);
        if (t?.captionDe) card.caption = stripDashes(t.captionDe, warnings, `${cfg.slug} #${cardNumber} caption`);
        return card;
      });

    const imageNums = new Set(m.cards.map((c) => c.cardNumber));
    for (const n of Object.keys(textCards)) {
      if (!imageNums.has(Number(n)))
        warnings.push(`[${cfg.slug}] card #${n} has DE text but no image (dropped)`);
    }

    decks.push({
      slug: cfg.slug,
      title: cfg.title,
      description: cfg.description,
      coverImageUrl: m.coverKey ? `${publicBaseUrl}/${m.coverKey}` : "",
      category: cfg.category,
      colorTheme: cfg.colorTheme,
      isActive: true,
      totalCards: cards.length,
      cards,
    });
    if (!m.coverKey) warnings.push(`[${cfg.slug}] no cover image (coverImageUrl empty)`);
  }
  return { decks, warnings };
}

function main() {
  const manifestPath = imagesManifestPath(lang);
  if (!fs.existsSync(manifestPath))
    throw new Error(
      `Missing ${manifestPath} — run optimize-images.mjs${lang === "de" ? " --lang de" : ""} first`
    );

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestBySlug = new Map(manifest.decks.map((d) => [d.slug, d]));

  const { decks, warnings } =
    lang === "de" ? buildGerman(manifestBySlug) : buildEnglish(manifestBySlug);

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0);
  const expectedDecks = lang === "de" ? EXPECTED_DECKS_DE : EXPECTED_DECKS;
  const expectedCards = lang === "de" ? EXPECTED_CARDS_DE : EXPECTED_CARDS;
  const exportName = lang === "de" ? "catalogDe" : "catalog";
  const outFile =
    lang === "de"
      ? path.join(PROJECT_ROOT, "convex", "catalogData.de.ts")
      : CATALOG_DATA_TS;

  const header =
    "// AUTO-GENERATED by scripts/build-catalog.mjs — DO NOT EDIT.\n" +
    `// Regenerate with: node --env-file=.env.local scripts/build-catalog.mjs${lang === "de" ? " --lang de" : ""}\n` +
    "/* eslint-disable */\n\n" +
    "export type CatalogCard = {\n" +
    "  imageUrl: string;\n  quote: string;\n  description: string;\n" +
    "  story?: string;\n  caption?: string;\n  cardNumber: number;\n};\n\n" +
    "export type CatalogDeck = {\n" +
    "  slug: string;\n  title: string;\n  description: string;\n  coverImageUrl: string;\n" +
    "  category: string;\n  colorTheme: string;\n  isActive: boolean;\n  totalCards: number;\n" +
    "  cards: CatalogCard[];\n};\n\n";

  const body =
    `export const ${exportName}: { decks: CatalogDeck[] } = ` +
    JSON.stringify({ decks }, null, 2) +
    ";\n";

  fs.writeFileSync(outFile, header + body);

  // ---- Summary ----
  for (const d of decks) {
    console.log(`  ${d.slug.padEnd(36)} ${String(d.totalCards).padStart(3)} cards`);
  }
  console.log(`\nLanguage: ${lang}`);
  console.log(`Decks: ${decks.length} (expected ${expectedDecks})`);
  console.log(`Cards: ${totalCards} (expected ${expectedCards})`);
  console.log(`Base URL: ${publicBaseUrl}`);
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 40)) console.log(`  ! ${w}`);
    if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
  }
  if (decks.length !== expectedDecks || totalCards !== expectedCards) {
    console.log(`\n⚠  Count mismatch — review warnings before importing.`);
  }
  console.log(`\nWrote ${outFile}`);
}

main();
