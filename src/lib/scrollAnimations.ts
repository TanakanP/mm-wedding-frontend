export function mapScrollProgress(
  progress: number,
  stops: readonly number[],
  values: readonly number[]
): number {
  if (progress <= stops[0]) return values[0];

  for (let index = 1; index < stops.length; index += 1) {
    if (progress <= stops[index]) {
      const localProgress =
        (progress - stops[index - 1]) / (stops[index] - stops[index - 1]);
      return (
        values[index - 1] +
        (values[index] - values[index - 1]) * localProgress
      );
    }
  }

  return values[values.length - 1];
}

export function getSectionScrollProgress(
  sectionTop: number,
  sectionHeight: number
): number {
  const travel = Math.max(1, sectionHeight);
  return Math.min(1, Math.max(0, -sectionTop / travel));
}
