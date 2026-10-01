import { mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Add future photographs here with a unique name and cropTop (0–1).
// Prepared entries populate the 60 slots in order, repeating only as needed.
const manifest = [{ name: 'placeholder', source: 'assets/rsvp-film/placeholder-source.jpg', cropTop: 0.30 }];
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
  const file = `${outputDirectory}/${entry.name}.webp`;
  await cropped.clone().resize(640, 360, { fit: 'fill', withoutEnlargement: true }).webp({ quality: 75, effort: 6 }).toFile(file);
  const bytes = (await stat(file)).size;
  if (bytes > 80000) throw new Error(`${file} exceeds the 80 KB budget (${bytes} bytes)`);
  const blur = await cropped.clone().resize(24, 14).webp({ quality: 35 }).toBuffer();
  const dimensions = await sharp(file).metadata();
  console.log(`${entry.name}: ${dimensions.width}x${dimensions.height}, ${bytes} bytes`);
  return { src: `/photos/display/rsvp-film/${entry.name}.webp`, alt: entry.alt ?? 'Natthida and Tanakan showing their wedding rings together in the garden', objectPosition: '50% 50%', blurDataURL: `data:image/webp;base64,${blur.toString('base64')}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = [];
  for (const entry of manifest) prepared.push(await prepareFilmPhoto(entry, out));
  await writeFile('src/content/rsvpFilmPhotos.json', JSON.stringify(prepared, null, 2) + '\n');
}
