import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "public/photos");
const outDir = join(srcDir, "display");

if (process.platform !== "darwin") {
  console.error("optimize-story-photos: requires macOS sips. Run on macOS or resize manually into public/photos/display/.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const ids = readdirSync(srcDir)
  .filter((name) => /^\d+\.jpeg$/.test(name))
  .map((name) => Number.parseInt(name, 10))
  .sort((a, b) => a - b);

for (const id of ids) {
  const input = join(srcDir, `${id}.jpeg`);
  const output = join(outDir, `${id}.jpeg`);
  if (!existsSync(input)) continue;
  execSync(`sips -Z 430 "${input}" --out "${output}"`, { stdio: "inherit" });
}

console.log(`Optimized ${ids.length} photos → public/photos/display/`);
