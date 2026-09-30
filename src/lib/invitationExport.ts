import { INVITATION_NAME_TOP, INVITATION_NAME_BOTTOM, layoutInvitationName } from "./invitationNameLayout";

const CARD_WIDTH = 1056;
const CARD_HEIGHT = 1489;
function paintGuestName(canvas: HTMLCanvasElement, guest: HTMLElement, text: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !text) throw new Error("Guest name could not be drawn");
  const style = getComputedStyle(guest);
  const isThai = guest.lang === "th";
  const spacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  const setFont = (size: number) => {
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
    spacing.letterSpacing = isThai ? "0px" : `${size * 0.01}px`;
  };
  const layout = layoutInvitationName(text, isThai, (candidate, size) => {
    setFont(size);
    return ctx.measureText(candidate).width;
  });
  setFont(layout.fontSize);
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const blockTop = (INVITATION_NAME_TOP + INVITATION_NAME_BOTTOM - layout.lines.length * layout.lineHeight) / 2;
  for (const [index, line] of layout.lines.entries()) {
    const metrics = ctx.measureText(line);
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;
    const glyphHeight = ascent + descent;
    const y = blockTop + index * layout.lineHeight + (layout.lineHeight - glyphHeight) / 2 + ascent;
    if (y - ascent < INVITATION_NAME_TOP || y + descent > INVITATION_NAME_BOTTOM) {
      throw new Error("Guest name could not fit in the invitation");
    }
    ctx.fillText(line, CARD_WIDTH / 2, y);
  }
}

export async function renderInvitationPng(element: HTMLElement): Promise<Blob> {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${CARD_WIDTH}px`;
  clone.style.height = `${CARD_HEIGHT}px`;
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.zIndex = "-1";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);
  try {
    await document.fonts.ready;
    const guest = clone.querySelector("p");
    const guestName = guest?.textContent ?? "";
    if (!guest || !guestName) throw new Error("Guest name is unavailable");
    const guestStyle = getComputedStyle(guest);
    await document.fonts.load(`${guestStyle.fontStyle} ${guestStyle.fontWeight} 64px ${guestStyle.fontFamily}`, guestName);
    guest.textContent = "";
    await Promise.all(Array.from(clone.querySelectorAll("img")).map(async (img) => {
      await img.decode();
      if (!img.naturalWidth) throw new Error("Invitation artwork could not load");
    }));
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(clone, {
      width: CARD_WIDTH, height: CARD_HEIGHT, scale: 1, backgroundColor: "#faf6f0", useCORS: false,
      scrollX: 0, scrollY: 0, windowWidth: CARD_WIDTH, windowHeight: CARD_HEIGHT,
    });
    if (guest && guestName) paintGuestName(canvas, guest, guestName);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Invitation picture could not be prepared");
    return blob;
  } finally {
    clone.remove();
  }
}
