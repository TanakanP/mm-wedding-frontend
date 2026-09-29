import { blessingSchema, normalizeBlessing, type NormalizedBlessing } from "../blessing.ts";
import { hasAllowedOrigin, readBoundedBody } from "./submitRsvp.ts";

type SavedRsvp = { name: string; attending: "yes" | "no" };
type Dependencies = {
  resolveRsvp: (submissionId: string) => Promise<SavedRsvp | null>;
  findBlessing: (blessingId: string, submissionId: string) => Promise<NormalizedBlessing | null>;
  append: (value: NormalizedBlessing, recordedAt: string) => Promise<void>;
  now?: () => string;
  rateLimit?: (request: Request) => Promise<boolean>;
};

const error = (status: number, code: string) => Response.json({ ok: false, code }, { status });

export function createBlessingHandler({ resolveRsvp, findBlessing, append, now = () => new Date().toISOString(), rateLimit }: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return error(415, "unsupported_media_type");
    if (!hasAllowedOrigin(request)) return error(403, "origin_not_allowed");
    if (Number(request.headers.get("content-length")) > 16_384) return error(413, "payload_too_large");
    let raw: string | null;
    try { raw = await readBoundedBody(request, 16_384); } catch { return error(400, "invalid_request"); }
    if (raw === null) return error(413, "payload_too_large");
    let input: unknown;
    try { input = JSON.parse(raw); } catch { return error(400, "invalid_json"); }
    const parsed = blessingSchema.safeParse(input);
    if (!parsed.success) return error(400, "invalid_blessing");
    const timestamp = now();
    if (Date.parse(parsed.data.transferredAt) > Date.parse(timestamp)) return error(400, "future_transfer");
    if (rateLimit && !(await rateLimit(request))) return error(429, "rate_limited");
    try {
      const rsvp = await resolveRsvp(parsed.data.submissionId);
      if (!rsvp) return error(404, "rsvp_not_found");
      if (rsvp.attending !== "no" || rsvp.name !== parsed.data.name) return error(409, "rsvp_mismatch");
      const value = normalizeBlessing({ ...parsed.data, name: rsvp.name });
      const existing = await findBlessing(value.blessingId, value.submissionId);
      if (existing && (existing.blessingId !== value.blessingId || existing.submissionId !== value.submissionId || existing.name !== value.name ||
        existing.amountThb !== value.amountThb || existing.transferredAt !== value.transferredAt)) return error(409, "blessing_conflict");
      if (!existing) await append(value, timestamp);
      return Response.json({ ok: true, submissionId: value.submissionId, blessingId: value.blessingId }, { status: 201 });
    } catch {
      return error(503, "save_unavailable");
    }
  };
}
