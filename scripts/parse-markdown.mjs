// Parse the card-decks vault Markdown into per-deck/per-card EN text.
//
//   node scripts/parse-markdown.mjs
//
// Reads VAULT_ROOT, writes out/text-catalog.json keyed by deckSlug:
//   { "<deckSlug>": { cards: { "<n>": { enTitle, enHeadline, storyEn?, captionEn? } } } }
//
// This step needs NO env and NO network. It does not require the images to exist —
// build-catalog.mjs joins this against the image manifest later.

import fs from "node:fs";
import path from "node:path";
import {
  VAULT_ROOT,
  OUT_DIR,
  TEXT_CATALOG,
  FLAT_DECKS,
  WISDOM_DECKS,
  WISDOM_LEAF_SIZE,
  pad2,
} from "./config.mjs";
import { parseImagePrompts, parseShareText } from "./lib/markdown.mjs";

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function mergeLeaf(cards, prompts, shares, numberOffset, source) {
  for (const [n, info] of prompts) {
    const cardNumber = n + numberOffset;
    const share = shares?.get(n) ?? {};
    cards[cardNumber] = {
      enTitle: info.enTitle,
      enHeadline: info.enHeadline,
      ...(share.storyEn ? { storyEn: share.storyEn } : {}),
      ...(share.captionEn ? { captionEn: share.captionEn } : {}),
      _source: source,
    };
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = {};
  const warnings = [];

  // ---- Flat decks ----
  for (const deck of FLAT_DECKS) {
    const dir = path.join(VAULT_ROOT, deck.slug);
    const promptsMd = readIfExists(path.join(dir, "image-prompts.md"));
    if (!promptsMd) {
      warnings.push(`[${deck.slug}] MISSING image-prompts.md at ${dir}`);
      catalog[deck.slug] = { cards: {} };
      continue;
    }
    const shareMd = readIfExists(path.join(dir, "share-text.md"));
    if (!shareMd) warnings.push(`[${deck.slug}] no share-text.md (story/caption omitted)`);
    const cards = {};
    mergeLeaf(
      cards,
      parseImagePrompts(promptsMd),
      shareMd ? parseShareText(shareMd) : null,
      0,
      `${deck.slug}/image-prompts.md`
    );
    catalog[deck.slug] = { cards };
  }

  // ---- Wisdom decks (two leaves each) ----
  for (const deck of WISDOM_DECKS) {
    const cards = {};
    deck.leaves.forEach((leaf, idx) => {
      const base = `${pad2(leaf.themeNum)}-${leaf.themeSlug}`;
      const promptsMd = readIfExists(path.join(VAULT_ROOT, "wisdom", `${base}.md`));
      if (!promptsMd) {
        warnings.push(`[${deck.slug}] MISSING wisdom/${base}.md`);
        return;
      }
      const shareMd = readIfExists(path.join(VAULT_ROOT, "wisdom", `${base}-share.md`));
      if (!shareMd) warnings.push(`[${deck.slug}] no wisdom/${base}-share.md`);
      mergeLeaf(
        cards,
        parseImagePrompts(promptsMd),
        shareMd ? parseShareText(shareMd) : null,
        idx * WISDOM_LEAF_SIZE,
        `wisdom/${base}.md`
      );
    });
    catalog[deck.slug] = { cards };
  }

  fs.writeFileSync(TEXT_CATALOG, JSON.stringify(catalog, null, 2));

  // ---- Summary ----
  let totalCards = 0;
  for (const deck of [...FLAT_DECKS, ...WISDOM_DECKS]) {
    const n = Object.keys(catalog[deck.slug]?.cards ?? {}).length;
    totalCards += n;
    console.log(`  ${deck.slug.padEnd(36)} ${n} cards`);
  }
  console.log(`\nParsed ${totalCards} card text entries across ${Object.keys(catalog).length} decks.`);
  if (warnings.length) {
    console.log(`\nNotices (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
  console.log(`\nWrote ${TEXT_CATALOG}`);
}

main();
