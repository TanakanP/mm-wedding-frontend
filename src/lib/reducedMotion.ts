export function resolveReducedMotion(
  mounted: boolean,
  prefersReduced: boolean | null
) {
  return mounted && prefersReduced === true;
}
