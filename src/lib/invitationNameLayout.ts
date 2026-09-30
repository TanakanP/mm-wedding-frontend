const NAME_WIDTH = 1056 * 0.62;
export const INVITATION_NAME_TOP = 1489 * 0.61;
export const INVITATION_NAME_BOTTOM = 1489 * 0.73;

export function layoutInvitationName(
  text: string,
  isThai: boolean,
  measure: (text: string, fontSize: number) => number,
): { lines: string[]; fontSize: number; lineHeight: number } {
  const graphemes = new Intl.Segmenter(isThai ? "th" : "en", { granularity: "grapheme" });
  const words = new Intl.Segmenter(isThai ? "th" : "en", { granularity: "word" });
  const length = Array.from(text).length;
  let fontSize = 1056 * (length > 70 ? 0.023 : length > 35 ? 0.032 : 0.06);
  const lineRatio = isThai ? 1.35 : 1.15;

  const wrap = (size: number): string[] => {
    const lines: string[] = [];
    let line = "";
    const push = () => { if (line.trim()) lines.push(line.trimEnd()); line = ""; };
    for (const { segment } of words.segment(text.trim())) {
      if (/^\s+$/u.test(segment)) {
        if (line) line += segment;
        continue;
      }
      if (measure(line + segment, size) <= NAME_WIDTH) {
        line += segment;
        continue;
      }
      push();
      // Long words fall back to whole graphemes, never individual combining marks.
      for (const { segment: grapheme } of graphemes.segment(segment)) {
        if (measure(line + grapheme, size) > NAME_WIDTH) push();
        if (measure(grapheme, size) > NAME_WIDTH) return [];
        line += grapheme;
      }
    }
    push();
    return lines;
  };

  for (;;) {
    const lines = wrap(fontSize);
    const lineHeight = fontSize * lineRatio;
    if (lines.length && lines.length * lineHeight <= INVITATION_NAME_BOTTOM - INVITATION_NAME_TOP) {
      return { lines, fontSize, lineHeight };
    }
    if (fontSize === 18) throw new Error("Guest name could not fit in the invitation");
    fontSize = Math.max(18, fontSize * 0.92);
  }
}
