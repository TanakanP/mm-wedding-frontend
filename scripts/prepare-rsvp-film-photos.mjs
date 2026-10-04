import { mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Pass the original-photo folder as the first argument if it has been moved.
// Originals stay in that folder; only small display derivatives enter public.
const defaultSourceDirectory = '/Users/tanakan.pramot/Documents/I found you - Mimi';
const out = 'public/photos/display/rsvp-film';

export async function prepareFilmPhoto(entry, outputDirectory) {
  if (!Number.isFinite(entry.cropTop) || entry.cropTop < 0 || entry.cropTop > 1) throw new Error('cropTop must be between 0 and 1');
  await mkdir(outputDirectory, { recursive: true });
  const source = await sharp(entry.source).rotate().toBuffer();
  const meta = await sharp(source).metadata();
  const cropWidth = Math.min(meta.width, Math.floor(meta.height * 16 / 9));
  const cropHeight = Math.min(meta.height, Math.floor(cropWidth * 9 / 16));
  const left = Math.floor((meta.width - cropWidth) / 2);
  const top = Math.round((meta.height - cropHeight) * entry.cropTop);
  const cropped = sharp(source).extract({ left, top, width: cropWidth, height: cropHeight });
  if (entry.grayscale) cropped.grayscale();
  const file = `${outputDirectory}/${entry.name}.webp`;
  const displayWidth = entry.displayWidth ?? 640;
  await cropped.clone().resize(displayWidth, Math.round(displayWidth * 9 / 16), { fit: 'fill', withoutEnlargement: true }).webp({ quality: entry.quality ?? 75, effort: 6 }).toFile(file);
  const bytes = (await stat(file)).size;
  if (bytes > 80000) throw new Error(`${file} exceeds the 80 KB budget (${bytes} bytes)`);
  const blur = await cropped.clone().resize(24, 14).webp({ quality: 35 }).toBuffer();
  const dimensions = await sharp(file).metadata();
  console.log(`${entry.name}: ${dimensions.width}x${dimensions.height}, ${bytes} bytes`);
  return { scene: entry.scene, src: `/photos/display/rsvp-film/${entry.name}.webp`, alt: entry.alt ?? 'Natthida and Tanakan showing their wedding rings together in the garden', objectPosition: '50% 50%', blurDataURL: `data:image/webp;base64,${blur.toString('base64')}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(await readFile('assets/rsvp-film/photo-manifest.json', 'utf8'));
  const sourceDirectory = resolve(process.argv[2] ?? defaultSourceDirectory);
  const prepared = [];
  for (const entry of manifest) {
    const source = entry.source ?? resolve(sourceDirectory, entry.sourceFile);
    prepared.push(await prepareFilmPhoto({ ...entry, source }, out));
  }
  await writeFile('src/content/rsvpFilmPhotos.json', JSON.stringify(prepared, null, 2) + '\n');
}
