// Optimize the source card JPGs into WebP and stage them under the R2 key scheme.
//
//   node scripts/optimize-images.mjs            # incremental (skips up-to-date)
//   node scripts/optimize-images.mjs --force    # re-encode everything
//   node scripts/optimize-images.mjs --clean     # wipe out/staging first
//
// No env, no network. Reads SOURCE_ROOT, writes:
//   out/staging/cards/<deckSlug>/<NN>.webp  +  .../cover.webp
//   out/images-manifest.json  { decks:[{ slug, coverKey, cards:[{cardNumber, key}] }] }

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import {
  SOURCE_ROOT,
  WISDOM_SOURCE_ROOT,
  STAGING_DIR,
  OUT_DIR,
  IMAGES_MANIFEST,
  FLAT_DECKS,
  WISDOM_DECKS,
  WISDOM_LEAF_SIZE,
  cardKey,
  coverKey,
} from "./config.mjs";

const FORCE = process.argv.includes("--force");
const CLEAN = process.argv.includes("--clean");
const IMG_RE = /\.(jpe?g|png|webp)$/i;

const warnings = [];
const dropped = [];

/** Classify a folder's image files into a cover + cardNumber->file map. */
function classify(dir) {
  const files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f));
  let cover = null;
  const byNum = new Map(); // num -> { file, hasEn }
  for (const f of files) {
    if (/cover/i.test(f)) {
      cover = cover ?? f;
      continue;
    }
    const m = f.match(/^(\d+)/);
    if (!m) {
      dropped.push(`${dir} :: ${f} (no leading number)`);
      continue;
    }
    const num = parseInt(m[1], 10);
    const hasEn = /^\d+\s*-?e[nm]/i.test(f); // -en / en / -em(typo) variant marker
    const prev = byNum.get(num);
    if (!prev) {
      byNum.set(num, { file: f, hasEn });
    } else if (hasEn && !prev.hasEn) {
      dropped.push(`${dir} :: ${prev.file} (dup of #${num}, prefer ${f})`);
      byNum.set(num, { file: f, hasEn });
    } else {
      dropped.push(`${dir} :: ${f} (dup of #${num}, kept ${prev.file})`);
    }
  }
  return { cover, byNum };
}

async function encode(srcPath, key) {
  const dest = path.join(STAGING_DIR, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!FORCE && fs.existsSync(dest)) {
    if (fs.statSync(dest).mtimeMs >= fs.statSync(srcPath).mtimeMs) return "skip";
  }
  await sharp(srcPath)
    .resize({ width: 768, height: 1024, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dest);
  return "ok";
}

async function runPool(items, worker, concurrency) {
  let idx = 0;
  let done = 0;
  async function lane() {
    while (idx < items.length) {
      const i = idx++;
      try {
        await worker(items[i]);
      } catch (e) {
        warnings.push(`encode failed ${items[i].key}: ${e.message}`);
      }
      if (++done % 50 === 0 || done === items.length) {
        process.stdout.write(`\r  encoded ${done}/${items.length}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, lane)
  );
  process.stdout.write("\n");
}

function main() {
  if (CLEAN && fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  const tasks = []; // { srcPath, key }
  const manifest = { decks: [] };

  // ---- Flat decks ----
  for (const deck of FLAT_DECKS) {
    const dir = path.join(SOURCE_ROOT, deck.sourceFolder);
    if (!fs.existsSync(dir)) {
      warnings.push(`[${deck.slug}] source folder missing: ${dir}`);
      continue;
    }
    const { cover, byNum } = classify(dir);
    const entry = { slug: deck.slug, coverKey: null, cards: [] };
    if (cover) {
      entry.coverKey = coverKey(deck.slug);
      tasks.push({ srcPath: path.join(dir, cover), key: entry.coverKey });
    } else {
      warnings.push(`[${deck.slug}] no cover image found`);
    }
    for (const num of [...byNum.keys()].sort((a, b) => a - b)) {
      const key = cardKey(deck.slug, num);
      tasks.push({ srcPath: path.join(dir, byNum.get(num).file), key });
      entry.cards.push({ cardNumber: num, key });
    }
    manifest.decks.push(entry);
  }

  // ---- Wisdom decks (merge two leaves -> 50 cards) ----
  for (const deck of WISDOM_DECKS) {
    const groupDir = path.join(WISDOM_SOURCE_ROOT, deck.subGroupFolder);
    if (!fs.existsSync(groupDir)) {
      warnings.push(`[${deck.slug}] sub-group folder missing: ${groupDir}`);
      continue;
    }
    const dirents = fs.readdirSync(groupDir, { withFileTypes: true });
    const entry = { slug: deck.slug, coverKey: null, cards: [] };

    const coverFile = dirents.find((d) => d.isFile() && /cover/i.test(d.name));
    if (coverFile) {
      entry.coverKey = coverKey(deck.slug);
      tasks.push({ srcPath: path.join(groupDir, coverFile.name), key: entry.coverKey });
    } else {
      warnings.push(`[${deck.slug}] no sub-cover image found in ${groupDir}`);
    }

    const leafDirs = dirents.filter((d) => d.isDirectory());
    deck.leaves.forEach((leaf, idx) => {
      const leafDir = leafDirs.find((d) => parseInt(d.name, 10) === leaf.themeNum);
      if (!leafDir) {
        warnings.push(`[${deck.slug}] leaf folder for theme #${leaf.themeNum} not found`);
        return;
      }
      const { byNum } = classify(path.join(groupDir, leafDir.name));
      for (const localNum of [...byNum.keys()].sort((a, b) => a - b)) {
        const cardNumber = idx * WISDOM_LEAF_SIZE + localNum;
        const key = cardKey(deck.slug, cardNumber);
        tasks.push({
          srcPath: path.join(groupDir, leafDir.name, byNum.get(localNum).file),
          key,
        });
        entry.cards.push({ cardNumber, key });
      }
    });
    entry.cards.sort((a, b) => a.cardNumber - b.cardNumber);
    manifest.decks.push(entry);
  }

  console.log(`Encoding ${tasks.length} images -> ${STAGING_DIR}`);
  return runPool(tasks, (t) => encode(t.srcPath, t.key), os.cpus().length).then(() => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(IMAGES_MANIFEST, JSON.stringify(manifest, null, 2));

    let totalCards = 0;
    let missingCover = 0;
    for (const d of manifest.decks) {
      totalCards += d.cards.length;
      if (!d.coverKey) missingCover++;
      const flag = d.cards.length === 50 ? "" : `  <-- expected 50`;
      console.log(`  ${d.slug.padEnd(36)} ${String(d.cards.length).padStart(3)} cards${flag}`);
    }
    console.log(
      `\nDecks: ${manifest.decks.length}  Cards: ${totalCards}  Covers: ${
        manifest.decks.length - missingCover
      }/${manifest.decks.length}`
    );
    if (dropped.length) {
      console.log(`\nNormalized/dropped duplicates (${dropped.length}):`);
      for (const d of dropped) console.log(`  - ${d}`);
    }
    if (warnings.length) {
      console.log(`\nWarnings (${warnings.length}):`);
      for (const w of warnings) console.log(`  ! ${w}`);
    }
    console.log(`\nWrote ${IMAGES_MANIFEST}`);
  });
}

main();
