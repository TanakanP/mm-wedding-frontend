import type { RSVPFormValues } from "./rsvp.ts";

export async function postRsvp(data: RSVPFormValues, submissionId: string, fetcher: typeof fetch = fetch, website = ""): Promise<void> {
  const response = await fetcher("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, submissionId, website }),
  });
  const result: unknown = await response.json();
  if (response.status !== 201 || !result || typeof result !== "object" ||
    !("ok" in result) || result.ok !== true ||
    !("submissionId" in result) || result.submissionId !== submissionId) {
    throw new Error("RSVP was not confirmed");
  }
}
