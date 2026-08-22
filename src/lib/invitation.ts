export const INVITATION_STORAGE_KEY = "mm-invitation-v1";
export const INVITATION_REPLAY_EVENT = "mm:replay-invitation";

export function shouldShowInvitation(storedValue: string | null) {
  return storedValue !== "opened";
}
