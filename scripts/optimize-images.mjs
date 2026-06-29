// Optimize the source card JPGs into WebP and stage them under the R2 key scheme.
//
//   node scripts/optimize-images.mjs              # EN, incremental (skips up-to-date)
//   node scripts/optimize-images.mjs --force      # re-encode everything
//   node scripts/optimize-images.mjs --clean      # wipe out/staging first
//   node scripts/optimize-images.mjs --lang de    # German edition (de/ key prefix)
//
// No env, no network. EN reads SOURCE_ROOT, DE reads GERMAN_SOURCE_ROOT, and writes:
//   EN: out/staging/cards/<deckSlug>/<NN>.webp     + .../cover.webp  -> out/images-manifest.json
//   DE: out/staging/de/cards/<deckSlug>/<NN>.webp  + .../cover.webp  -> out/images-manifest.de.json
//   manifest: { decks:[{ slug, coverKey, cards:[{cardNumber, key}] }] }

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import {
  SOURCE_ROOT,
  WISDOM_SOURCE_ROOT,
  STAGING_DIR,
  OUT_DIR,
  FLAT_DECKS,
  WISDOM_DECKS,
  WISDOM_LEAF_SIZE,
  germanDecks,
  imagesManifestPath,
  cardKey,
  coverKey,
} from "./config.mjs";

const FORCE = process.argv.includes("--force");
const CLEAN = process.argv.includes("--clean");
const IMG_RE = /\.(jpe?g|png|webp)$/i;

/** Read a `--flag value` or `--flag=value` argument. */
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(`${flag}=`));
  return eq ? eq.slice(flag.length + 1) : null;
}

const LANG = (argValue("--lang") || "en").toLowerCase();
const PREFIX = LANG === "de" ? "de/" : ""; // R2 key namespace per language
// Which numbered-file variant "wins" if a folder ever has duplicates (-en vs -de).
const PREFER_RE = LANG === "de" ? /^\d+\s*-?de/i : /^\d+\s*-?e[nm]/i;

const warnings = [];
const dropped = [];

/** Classify a folder's image files into a cover + cardNumber->file map. */
function classify(dir, preferRe = PREFER_RE) {
  const files = fs.readdirSync(dir).filter((f) => IMG_RE.test(f));
  let cover = null;
  const byNum = new Map(); // num -> { file, hasPreferred }
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
    const hasPreferred = preferRe.test(f); // preferred language variant marker
    const prev = byNum.get(num);
    if (!prev) {
      byNum.set(num, { file: f, hasPreferred });
    } else if (hasPreferred && !prev.hasPreferred) {
      dropped.push(`${dir} :: ${prev.file} (dup of #${num}, prefer ${f})`);
      byNum.set(num, { file: f, hasPreferred });
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

/** EN: 10 flat decks + 10 Wisdom decks (each merging two 25-card leaves -> 50). */
function collectEnglish(tasks, manifest) {
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
}

/** DE: all 33 German decks are flat 50-card folders (Weisheiten included, pre-merged). */
function collectGerman(tasks, manifest) {
  for (const deck of germanDecks()) {
    const dir = path.join(deck.root, deck.folder);
    if (!fs.existsSync(dir)) {
      warnings.push(`[${deck.slug}] German source folder missing: ${dir}`);
      continue;
    }
    const { cover, byNum } = classify(dir);
    const entry = { slug: deck.slug, coverKey: null, cards: [] };
    if (cover) {
      entry.coverKey = coverKey(deck.slug, PREFIX);
      tasks.push({ srcPath: path.join(dir, cover), key: entry.coverKey });
    } else {
      warnings.push(`[${deck.slug}] no cover image found (${deck.folder})`);
    }
    for (const num of [...byNum.keys()].sort((a, b) => a - b)) {
      const key = cardKey(deck.slug, num, PREFIX);
      tasks.push({ srcPath: path.join(dir, byNum.get(num).file), key });
      entry.cards.push({ cardNumber: num, key });
    }
    manifest.decks.push(entry);
  }
}

function main() {
  if (CLEAN && fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGING_DIR, { recursive: true });

  const tasks = []; // { srcPath, key }
  const manifest = { decks: [] };

  if (LANG === "de") collectGerman(tasks, manifest);
  else collectEnglish(tasks, manifest);

  console.log(`Encoding ${tasks.length} images (${LANG}) -> ${STAGING_DIR}`);
  return runPool(tasks, (t) => encode(t.srcPath, t.key), os.cpus().length).then(() => {
    const manifestPath = imagesManifestPath(LANG);
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

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
    console.log(`\nWrote ${manifestPath}`);
  });
}

main();
