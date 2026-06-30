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
  TEXT_CATALOG_DE,
  GERMAN_STORIES,
  FLAT_DECKS,
  WISDOM_DECKS,
  WISDOM_LEAF_SIZE,
  germanFlatTextSources,
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

// Build the German per-card text catalog (keyed by German deck slug):
//   { "<deckSlug>": { cards: { "<n>": { deTitle, deHeadline, storyDe?, captionDe? } } } }
// Flat decks read one image-prompts.md (+ optional share-text.md); wisdom decks
// merge their two 25-card leaves into a 50-card deck, matching the German images
// which ship pre-merged in the same leaf order.
function buildGermanCatalog(warnings) {
  const de = {};

  const addCards = (target, prompts, shares, offset) => {
    for (const [n, info] of prompts) {
      const cardNumber = n + offset;
      const share = shares?.get(n) ?? {};
      target[cardNumber] = {
        deTitle: info.deTitle,
        deHeadline: info.deHeadline,
        ...(share.storyDe ? { storyDe: share.storyDe } : {}),
        ...(share.captionDe ? { captionDe: share.captionDe } : {}),
      };
    }
  };

  // Flat decks (10 shared + 13 German-only)
  for (const { slug, vaultSlug } of germanFlatTextSources()) {
    const dir = path.join(VAULT_ROOT, vaultSlug);
    const promptsMd = readIfExists(path.join(dir, "image-prompts.md"));
    if (!promptsMd) {
      warnings.push(`[DE ${slug}] MISSING ${vaultSlug}/image-prompts.md`);
      de[slug] = { cards: {} };
      continue;
    }
    const shareMd = readIfExists(path.join(dir, "share-text.md"));
    if (!shareMd) warnings.push(`[DE ${slug}] no ${vaultSlug}/share-text.md (story/caption omitted)`);
    const cards = {};
    addCards(
      cards,
      parseImagePrompts(promptsMd),
      shareMd ? parseShareText(shareMd) : null,
      0
    );
    de[slug] = { cards };
  }

  // Wisdom decks (two leaves merged 1..25 / 26..50)
  for (const deck of WISDOM_DECKS) {
    const cards = {};
    deck.leaves.forEach((leaf, idx) => {
      const base = `${pad2(leaf.themeNum)}-${leaf.themeSlug}`;
      const promptsMd = readIfExists(path.join(VAULT_ROOT, "wisdom", `${base}.md`));
      if (!promptsMd) {
        warnings.push(`[DE ${deck.slug}] MISSING wisdom/${base}.md`);
        return;
      }
      const shareMd = readIfExists(path.join(VAULT_ROOT, "wisdom", `${base}-share.md`));
      if (!shareMd) warnings.push(`[DE ${deck.slug}] no wisdom/${base}-share.md`);
      addCards(
        cards,
        parseImagePrompts(promptsMd),
        shareMd ? parseShareText(shareMd) : null,
        idx * WISDOM_LEAF_SIZE
      );
    });
    de[deck.slug] = { cards };
  }

  // Overlay authored story/caption for the German-only decks (no vault share-text).
  if (fs.existsSync(GERMAN_STORIES)) {
    const overlay = JSON.parse(fs.readFileSync(GERMAN_STORIES, "utf8"));
    let applied = 0;
    for (const [slug, byNum] of Object.entries(overlay)) {
      const cards = de[slug]?.cards;
      if (!cards) {
        warnings.push(`[DE ${slug}] story overlay has no matching deck`);
        continue;
      }
      for (const [n, v] of Object.entries(byNum)) {
        if (!cards[n]) {
          warnings.push(`[DE ${slug}] story overlay card #${n} has no parsed card`);
          continue;
        }
        if (v.storyDe) cards[n].storyDe = v.storyDe;
        if (v.captionDe) cards[n].captionDe = v.captionDe;
        applied++;
      }
    }
    console.log(`Applied German story/caption overlay to ${applied} cards.`);
  } else {
    warnings.push(
      `German story overlay not found (${GERMAN_STORIES}); German-only decks ship headline + title only.`
    );
  }

  return de;
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

  // ---- German catalog (33 decks, keyed by German deck slug) ----
  const de = buildGermanCatalog(warnings);
  fs.writeFileSync(TEXT_CATALOG_DE, JSON.stringify(de, null, 2));

  // ---- Summary ----
  let totalCards = 0;
  for (const deck of [...FLAT_DECKS, ...WISDOM_DECKS]) {
    const n = Object.keys(catalog[deck.slug]?.cards ?? {}).length;
    totalCards += n;
    console.log(`  ${deck.slug.padEnd(36)} ${n} cards`);
  }
  console.log(`\nParsed ${totalCards} EN card text entries across ${Object.keys(catalog).length} decks.`);

  let deTotal = 0,
    deStory = 0;
  for (const slug of Object.keys(de)) {
    const cards = Object.values(de[slug]?.cards ?? {});
    deTotal += cards.length;
    deStory += cards.filter((c) => c.storyDe).length;
  }
  console.log(
    `Parsed ${deTotal} DE card text entries across ${Object.keys(de).length} decks (${deStory} with story/caption).`
  );

  if (warnings.length) {
    console.log(`\nNotices (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
  console.log(`\nWrote ${TEXT_CATALOG}`);
  console.log(`Wrote ${TEXT_CATALOG_DE}`);
}

main();
