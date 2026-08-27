#!/usr/bin/env node
/**
 * Generates optimized WebP variants of the source images and the favicon
 * set from the logo, per spec Sections 2 & 21. Run after `npm install`
 * (needs the root `sharp` devDependency):
 *
 *   npm run prepare-assets
 *
 * Safe to re-run — every output is deterministic and overwritten in place.
 * This is a build-time tool, not part of the request-serving path, so it
 * intentionally lives outside client/src and server/src.
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, "../client/public/assets/images");
const GENERATED_DIR = path.resolve(__dirname, "../client/public/assets/images/generated");

const FAVICON_SIZES = [16, 32];

async function main() {
  await mkdir(GENERATED_DIR, { recursive: true });

  const files = await readdir(IMAGES_DIR);
  const sourceImages = files.filter((f) => /\.(png|jpe?g)$/i.test(f));

  for (const file of sourceImages) {
    const inputPath = path.join(IMAGES_DIR, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(GENERATED_DIR, `${baseName}.webp`);
    await sharp(inputPath).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(outputPath);
    console.log(`✓ ${file} → generated/${baseName}.webp`);
  }

  const logoPath = path.join(IMAGES_DIR, "logo-original.jpeg");
  for (const size of FAVICON_SIZES) {
    const outputPath = path.join(GENERATED_DIR, `favicon-${size}x${size}.png`);
    await sharp(logoPath).resize(size, size, { fit: "cover" }).png().toFile(outputPath);
    console.log(`✓ favicon-${size}x${size}.png`);
  }

  const appleTouchPath = path.join(GENERATED_DIR, "apple-touch-icon.png");
  await sharp(logoPath).resize(180, 180, { fit: "cover" }).png().toFile(appleTouchPath);
  console.log("✓ apple-touch-icon.png");

  console.log("\nDone. Update index.html / <picture> sources to point at /assets/images/generated/*.webp once verified.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
