export async function renderInvitationPng(element: HTMLElement): Promise<Blob> {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = "1500px";
  clone.style.height = "2114px";
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.zIndex = "-1";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);
  try {
    await document.fonts.ready;
    await Promise.all(Array.from(clone.querySelectorAll("img")).map(async (img) => {
      await img.decode();
      if (!img.naturalWidth) throw new Error("Invitation artwork could not load");
    }));
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(clone, {
      width: 1500, height: 2114, scale: 1, backgroundColor: "#fff8ee", useCORS: false,
      scrollX: 0, scrollY: 0, windowWidth: 1500, windowHeight: 2114,
    });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Invitation picture could not be prepared");
    return blob;
  } finally {
    clone.remove();
  }
}
