import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('the six attached photos retain their per-strip order after preparation', async () => {
 const manifest=JSON.parse(await readFile(new URL('../assets/rsvp-film/photo-manifest.json',import.meta.url),'utf8'));
 const prepared=JSON.parse(await readFile(new URL('../src/content/rsvpFilmPhotos.json',import.meta.url),'utf8'));
 assert.deepEqual(manifest.map(p=>p.sourceFile),[81,82,114,194,254,33].map(n=>`I found you -${n}.jpg`));
 assert.ok(manifest.every(p=>p.grayscale===true));
 assert.deepEqual(prepared.map(p=>p.src.split('/').at(-1)),manifest.map(p=>`${p.name}.webp`));
});
