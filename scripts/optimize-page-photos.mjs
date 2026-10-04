import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/photos/display/page");
const longEdge = 2400;

const jobs = [
  ["public/photos/display/opening-background-expanded.png", "opening-background-expanded"],
  ["public/photos/display/opening-envelope.jpeg", "opening-envelope"],
  ["public/photos/display/framed-background-running.jpeg", "framed-background-running"],
  ["public/photos/display/framed-center-piggyback.jpeg", "framed-center-piggyback"],
  ["public/photos/display/gallery-1-bench.jpg", "gallery-1-bench"],
  ["public/photos/display/gallery-2-embrace.jpg", "gallery-2-embrace"],
  ["public/photos/display/gallery-3-rings.jpeg", "gallery-3-rings"],
  ["public/photos/display/gallery-4-lakeside.jpg", "gallery-4-lakeside"],
  ["public/photos/display/final-memory-running.jpeg", "final-memory-running"],
  ["public/photos/display/rsvp-background.jpg", "rsvp-background"],
  ["public/photos/frames/ornate-ivory.png", "ornate-ivory"],
];

mkdirSync(outDir, { recursive: true });
const blurs = {};

for (const [relativeInput, name] of jobs) {
  const input = join(root, relativeInput);
  const meta = await sharp(input, { failOn: "none" }).rotate().metadata();
  const landscape = (meta.width ?? 0) >= (meta.height ?? 0);
  let pipeline = sharp(input, { failOn: "none" }).rotate();
  if (Math.max(meta.width ?? 0, meta.height ?? 0) > longEdge) {
    pipeline = pipeline.resize({
      width: landscape ? longEdge : undefined,
      height: landscape ? undefined : longEdge,
      withoutEnlargement: true,
    });
  }
  const output = join(outDir, `${name}.webp`);
  await pipeline.webp({
    quality: meta.hasAlpha ? 86 : 82,
    alphaQuality: meta.hasAlpha ? 100 : 80,
    effort: 4,
  }).toFile(output);
  const blur = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(24, 24, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  const url = `/photos/display/page/${name}.webp`;
  blurs[url] = `data:image/webp;base64,${blur.toString("base64")}`;
  const outMeta = await sharp(output).metadata();
  console.log(
    `${name}: ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}, ${Math.round(statSync(output).size / 1024)}KB, alpha=${Boolean(meta.hasAlpha)}`,
  );
}

const weddingPath = join(root, "src/content/wedding.ts");
const wedding = readFileSync(weddingPath, "utf8");
const block = `const photoBlurs = ${JSON.stringify(blurs, null, 2)} as const;\n\n`;
const marked = wedding.includes("// photo-blurs:start")
  ? wedding.replace(/\/\/ photo-blurs:start\n[\s\S]*?\/\/ photo-blurs:end\n+/, `// photo-blurs:start\n${block}// photo-blurs:end\n\n`)
  : wedding.replace("export const V4_SECTION_IDS = [", `// photo-blurs:start\n${block}// photo-blurs:end\nexport const V4_SECTION_IDS = [`);
writeFileSync(weddingPath, marked);
console.log(`Wrote ${jobs.length} derivatives into src/content/wedding.ts`);
