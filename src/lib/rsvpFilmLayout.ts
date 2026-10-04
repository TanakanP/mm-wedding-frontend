export interface RSVPFilmLayout {
  angleDeg: number;
  planeWidth: number;
  planeHeight: number;
  framePitch: number;
  railHeight: number;
  rowPitch: number;
  rowCount: number;
  sequenceRepeats: number;
  groupWidth: number;
}

export function getRSVPFilmLayout(width: number, height: number): RSVPFilmLayout | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const mobile = width < 768;
  const angleDeg = mobile ? -3 : -6;
  const angle = Math.abs(angleDeg) * Math.PI / 180;
  const planeWidth = Math.ceil(width * Math.cos(angle) + height * Math.sin(angle)) + 96;
  const requiredHeight = Math.ceil(height * Math.cos(angle) + width * Math.sin(angle)) + 96;
  const framePitch = mobile ? 180 : Math.min(280, Math.max(220, width * 0.2));
  const railHeight = mobile ? 16 : 22;
  const rowPitch = (framePitch - 12) * 9 / 16 + 2 * railHeight + 2;
  const rowCount = Math.ceil(requiredHeight / rowPitch);
  const sequenceRepeats = Math.max(1, Math.ceil(planeWidth / (8 * framePitch)));
  return { angleDeg, planeWidth, planeHeight: rowCount * rowPitch, framePitch, railHeight, rowPitch, rowCount, sequenceRepeats, groupWidth: sequenceRepeats * 8 * framePitch };
}

export type FilmStripLayout = RSVPFilmLayout & { stageHeight: number };

export function getFilmStripLayout(width: number): FilmStripLayout | null {
  const base = getRSVPFilmLayout(width, 1);
  if (!base) return null;
  const stripHeight = Math.ceil(base.rowPitch * 3);
  const railHeight = width < 768 ? 24 : 32;
  const framePitch = (stripHeight - 2 * railHeight - 2) * 16 / 9 + 12;
  const planeWidth = getRSVPFilmLayout(width, stripHeight)!.planeWidth;
  const angle = Math.abs(base.angleDeg) * Math.PI / 180;
  const stageHeight = Math.ceil(stripHeight * Math.cos(angle) + planeWidth * Math.sin(angle)) + 16;
  const sequenceRepeats = Math.max(1, Math.ceil(planeWidth / (8 * framePitch)));
  return {
    angleDeg: base.angleDeg, planeWidth, planeHeight: stripHeight, framePitch, railHeight,
    rowPitch: stripHeight, rowCount: 1, sequenceRepeats,
    groupWidth: sequenceRepeats * 8 * framePitch, stageHeight,
  };
}

export function selectRSVPFilmPhotos<T>(photos: readonly T[], width: number, start: number, saveData: boolean): T[] {
  if (!photos.length) return [];
  const limit = saveData ? 8 : width < 768 ? 16 : 32;
  const offset = ((Math.floor(start) % photos.length) + photos.length) % photos.length;
  return Array.from({ length: Math.min(limit, photos.length) }, (_, i) => photos[(offset + i) % photos.length]);
}

export function getRSVPFilmRow<T>(photos: readonly T[], row: number, slots: number): T[] {
  if (!photos.length) return [];
  // A seed per row keeps server/client markup and subsequent renders identical.
  let seed = Math.imul(row + 1, 2654435761) >>> 0;
  const shuffle = () => {
    const pool = [...photos];
    for (let i = pool.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = Math.floor(seed / 4294967296 * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };
  const sequence: T[] = [];
  let pool: T[] = [];
  for (let slot = 0; slot < slots; slot++) {
    if (!pool.length) pool = shuffle();
    const allowed = (photo: T) => photos.length === 1 ||
      (photo !== sequence.at(-1) && (slot !== slots - 1 || photo !== sequence[0]));
    let next = pool.findIndex(allowed);
    if (next < 0) { pool = shuffle(); next = pool.findIndex(allowed); }
    sequence.push(pool.splice(next, 1)[0]);
  }
  return sequence;
}
