const suffix = "-Mimeen-Wedding-Invitation.png";

export function getInvitationFilename(guestName: string): string {
  const safeName = guestName.normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[.\s-]+|[.\s-]+$/g, "");
  return `${safeName || "Guest"}${suffix}`;
}
