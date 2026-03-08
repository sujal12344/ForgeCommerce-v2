/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Bundle size guard — runs after `next build`.
 * Fails CI if any single client-side JS chunk exceeds MAX_CHUNK_KB.
 * Tweak the threshold as the project grows.
 */

const fs = require("fs");
const path = require("path");

const MAX_CHUNK_KB = 500; // 500 KB uncompressed per chunk
const CHUNKS_DIR = path.join(".next", "static", "chunks");

if (!fs.existsSync(CHUNKS_DIR)) {
  console.log("⚠️  .next/static/chunks not found — skipping bundle check.");
  process.exit(0);
}

const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith(".js"));

if (files.length === 0) {
  console.log("No JS chunks found.");
  process.exit(0);
}

let failed = false;
const oversized = [];

for (const file of files) {
  const filePath = path.join(CHUNKS_DIR, file);
  const sizeKB = fs.statSync(filePath).size / 1024;
  if (sizeKB > MAX_CHUNK_KB) {
    oversized.push({ file, sizeKB: sizeKB.toFixed(1) });
    failed = true;
  }
}

if (failed) {
  console.error(
    `\n❌ Bundle size limit exceeded (${MAX_CHUNK_KB} KB per chunk):\n`
  );
  for (const { file, sizeKB } of oversized) {
    console.error(`   ${sizeKB} KB  →  ${file}`);
  }
  console.error(
    "\nHints: Check for accidental barrel imports, large dependencies, or missing dynamic imports."
  );
  process.exit(1);
} else {
  console.log(
    `✅ All ${files.length} chunks are within the ${MAX_CHUNK_KB} KB limit.`
  );
}
