import sharp from "sharp";
import { readFile, writeFile, stat } from "fs/promises";

const targets = [
  "public/og-image.png",
  "public/twitter-image.png",
  "public/android-chrome-512x512.png",
  "public/android-chrome-192x192.png",
  "public/apple-touch-icon.png",
];

const before = [];
const after = [];

for (const file of targets) {
  const original = await stat(file);
  before.push({ file, size: original.size });

  const input = await readFile(file);

  // Quantize to 256-color palette + max compression. For OG/Twitter cards
  // and brand icons (text + simple graphics, not photographic) the loss
  // is imperceptible.
  const optimized = await sharp(input)
    .png({ palette: true, compressionLevel: 9, effort: 10 })
    .toBuffer();

  if (optimized.length < input.length) {
    await writeFile(file, optimized);
    after.push({ file, size: optimized.length });
  } else {
    after.push({ file, size: input.length, note: "skipped (not smaller)" });
  }
}

console.log("Before / After (bytes):");
for (let i = 0; i < before.length; i++) {
  const b = before[i].size;
  const a = after[i].size;
  const pct = ((1 - a / b) * 100).toFixed(1);
  const note = after[i].note ? `  [${after[i].note}]` : "";
  console.log(
    `  ${before[i].file}: ${b.toLocaleString()} -> ${a.toLocaleString()} (-${pct}%)${note}`,
  );
}
