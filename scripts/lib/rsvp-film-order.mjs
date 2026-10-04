// Keep related scenes apart in the circular library, including common row and
// active-set wrap offsets. Preparation is deterministic; nothing reshuffles on render.
export function scrambleFilmPhotos(photos, seed = 20261010) {
  if (photos.length < 3) return [...photos];
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  const penalties = [[1, 1000], [2, 100], [3, 35], [4, 10], [5, 4], [11, 8], [15, 4], [31, 4]];
  const score = order => penalties.reduce((sum, [distance, weight]) => distance >= order.length ? sum :
    sum + order.reduce((subtotal, photo, i) => subtotal + (photo.scene && photo.scene === order[(i + distance) % order.length].scene ? weight : 0), 0), 0);
  let order = [...photos];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]];
  }
  let current = score(order), best = [...order], bestScore = current;
  for (let step = 0; step < 24000; step++) {
    const i = Math.floor(random() * order.length), j = Math.floor(random() * order.length);
    if (i === j) continue;
    [order[i], order[j]] = [order[j], order[i]];
    const next = score(order), temperature = 18 * (1 - step / 24000) + 0.1;
    if (next <= current || random() < Math.exp((current - next) / temperature)) current = next;
    else [order[i], order[j]] = [order[j], order[i]];
    if (current < bestScore) { bestScore = current; best = [...order]; }
  }
  return best;
}
