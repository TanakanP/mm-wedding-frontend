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
  const railHeight = mobile ? 12 : 16;
  const rowPitch = (framePitch - 12) * 9 / 16 + 2 * railHeight + 2;
  const rowCount = Math.ceil(requiredHeight / rowPitch);
  const sequenceRepeats = Math.max(1, Math.ceil(planeWidth / (8 * framePitch)));
  return { angleDeg, planeWidth, planeHeight: rowCount * rowPitch, framePitch, railHeight, rowPitch, rowCount, sequenceRepeats, groupWidth: sequenceRepeats * 8 * framePitch };
}

export function selectRSVPFilmPhotos<T>(photos: readonly T[], width: number, start: number, saveData: boolean): T[] {
  if (!photos.length) return [];
  const limit = saveData ? 8 : width < 768 ? 16 : 32;
  const offset = ((Math.floor(start) % photos.length) + photos.length) % photos.length;
  return Array.from({ length: Math.min(limit, photos.length) }, (_, i) => photos[(offset + i) % photos.length]);
}
