// Apply a CORS policy to the R2 bucket so cross-origin consumers get a proper
// Access-Control-Allow-Origin header.
//
//   node --env-file=.env.local scripts/set-r2-cors.mjs
//
// Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.
// Optionally set R2_CORS_ORIGINS to a comma-separated allow-list; defaults to
// "*" since the card images are public.
//
// Why this is needed: the card artwork is loaded cross-origin by features that
// rasterize it to a <canvas> (Share/export via html-to-image) — and a tainted
// cross-origin image makes canvas export throw. The default R2 bucket has no
// CORS policy, so the browser is refused. This makes the r2.dev URLs return
// Access-Control-Allow-Origin reliably.
//
// Note: objects are served `Cache-Control: immutable`, so a browser that
// already cached a no-CORS copy may need a hard reload to pick up the header.

import {
  S3Client,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getR2Env } from "./config.mjs";

const env = getR2Env(["accountId", "accessKeyId", "secretAccessKey", "bucket"]);

const origins = (process.env.R2_CORS_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
});

async function main() {
  console.log(
    `Bucket: ${env.bucket}  Endpoint: ${env.accountId}.r2.cloudflarestorage.com`
  );
  console.log(`Allowed origins: ${origins.join(", ")}`);

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: env.bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: origins,
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );
  console.log("CORS policy applied.");

  // Read it back so the applied rules are visible in the log.
  const current = await s3.send(
    new GetBucketCorsCommand({ Bucket: env.bucket })
  );
  console.log("Current CORS rules:");
  console.log(JSON.stringify(current.CORSRules, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
