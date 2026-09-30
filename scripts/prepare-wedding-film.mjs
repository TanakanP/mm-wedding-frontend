import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  crf: { type: 'string', default: '25' },
  output: { type: 'string' },
  'poster-time': { type: 'string', default: '1' },
}});
if (positionals.length !== 1 || !/^\d+$/.test(values.crf) || Number(values.crf) > 51 || !/^\d+(\.\d+)?$/.test(values['poster-time'])) {
  throw new Error('Usage: node scripts/prepare-wedding-film.mjs SOURCE [--crf 23|25] [--output DIRECTORY] [--poster-time 1]');
}
const source = resolve(positionals[0]);
const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=color_transfer', '-of', 'json', source], { encoding: 'utf8' });
if (probe.status !== 0) throw new Error(`Could not read source video: ${probe.stderr}`);
const transfer = JSON.parse(probe.stdout).streams[0]?.color_transfer;
const hdr = transfer === 'arib-std-b67' || transfer === 'smpte2084';
const filters = spawnSync('ffmpeg', ['-hide_banner', '-filters'], { encoding: 'utf8' });
if (hdr && !/\bzscale\b/.test(filters.stdout)) {
  throw new Error('HDR conversion requires FFmpeg with zscale/libzimg. Use that build or supply an already tone-mapped SDR source; do not strip HDR tags without tone mapping.');
}
const colorFilter = hdr ? 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,' : '';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = values.output ? resolve(values.output) : join(root, 'public/videos');
mkdirSync(output, { recursive: true });
const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
};
run('ffmpeg', ['-hide_banner', '-y', '-i', source, '-map', '0:v:0', '-map', '0:a:0?',
  '-vf', `${colorFilter}scale=720:1280:flags=lanczos,format=yuv420p`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', values.crf,
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-map_metadata', '-1',
  join(output, 'wedding-film.mp4')]);
run('ffmpeg', ['-hide_banner', '-y', '-ss', values['poster-time'], '-i', join(output, 'wedding-film.mp4'),
  '-frames:v', '1', '-update', '1', '-q:v', '3', join(output, 'wedding-film-poster.jpg')]);
run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,pix_fmt,color_space,color_transfer,color_primaries:format=duration,size', '-of', 'json', join(output, 'wedding-film.mp4')]);
