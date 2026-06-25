// Upload the staged WebP files to Cloudflare R2 (S3-compatible API).
//
//   node --env-file=.env.local scripts/upload-r2.mjs            # resumable
//   node --env-file=.env.local scripts/upload-r2.mjs --force    # re-upload everything
//   node --env-file=.env.local scripts/upload-r2.mjs --verify   # HEAD-check after upload
//
// Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.
// Object keys mirror their path under out/staging (e.g. cards/trees/01.webp).

import fs from "node:fs";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { STAGING_DIR, UPLOAD_LEDGER, getR2Env } from "./config.mjs";

const FORCE = process.argv.includes("--force");
const VERIFY = process.argv.includes("--verify");
const env = getR2Env(["accountId", "accessKeyId", "secretAccessKey", "bucket"]);

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
});

function walk(dir) {
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...walk(p));
    else if (/\.webp$/i.test(d.name)) out.push(p);
  }
  return out;
}

function loadLedger() {
  if (FORCE || !fs.existsSync(UPLOAD_LEDGER)) return new Set();
  try {
    return new Set(JSON.parse(fs.readFileSync(UPLOAD_LEDGER, "utf8")));
  } catch {
    return new Set();
  }
}

async function main() {
  if (!fs.existsSync(STAGING_DIR))
    throw new Error(`Missing ${STAGING_DIR} — run optimize-images.mjs first`);

  const files = walk(STAGING_DIR);
  const ledger = loadLedger();
  const toKey = (p) => path.relative(STAGING_DIR, p).split(path.sep).join("/");
  const pending = files.filter((p) => FORCE || !ledger.has(toKey(p)));

  console.log(
    `Bucket: ${env.bucket}  Endpoint: ${env.accountId}.r2.cloudflarestorage.com`
  );
  console.log(
    `${files.length} staged objects, ${ledger.size} already uploaded, ${pending.length} to send.`
  );

  let done = 0;
  let failed = 0;
  let idx = 0;
  const CONCURRENCY = 10;

  async function lane() {
    while (idx < pending.length) {
      const p = pending[idx++];
      const key = toKey(p);
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: env.bucket,
            Key: key,
            Body: fs.readFileSync(p),
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
        ledger.add(key);
        if (++done % 25 === 0 || done + failed === pending.length) {
          process.stdout.write(`\r  uploaded ${done}/${pending.length}`);
          fs.writeFileSync(UPLOAD_LEDGER, JSON.stringify([...ledger]));
        }
      } catch (e) {
        failed++;
        console.warn(`\n  ! ${key}: ${e.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, lane)
  );
  process.stdout.write("\n");
  fs.writeFileSync(UPLOAD_LEDGER, JSON.stringify([...ledger]));
  console.log(`Uploaded ${done}, failed ${failed}.`);

  if (VERIFY) {
    console.log("Verifying via HEAD (sampling 1 in 20)...");
    let checked = 0;
    let missing = 0;
    for (let i = 0; i < files.length; i += 20) {
      const key = toKey(files[i]);
      try {
        await s3.send(new HeadObjectCommand({ Bucket: env.bucket, Key: key }));
      } catch {
        missing++;
        console.warn(`  ! missing on R2: ${key}`);
      }
      checked++;
    }
    console.log(`Verified ${checked} sampled objects, ${missing} missing.`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
