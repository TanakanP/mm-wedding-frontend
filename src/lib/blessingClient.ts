import type { BlessingPayload } from "./blessing.ts";

export async function postBlessing(data: BlessingPayload, fetcher: typeof fetch = fetch): Promise<void> {
  const response = await fetcher("/api/blessing", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  const result: unknown = await response.json();
  if (response.status !== 201 || !result || typeof result !== "object" ||
    !("ok" in result) || result.ok !== true ||
    !("submissionId" in result) || result.submissionId !== data.submissionId ||
    !("blessingId" in result) || result.blessingId !== data.blessingId) {
    throw new Error("Blessing details were not confirmed");
  }
}
