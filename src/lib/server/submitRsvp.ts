import * as z from "zod";
import { normalizeRsvp, rsvpSchema, type NormalizedRSVP } from "../rsvp.ts";

const payloadSchema = rsvpSchema.safeExtend({
  submissionId: z.uuid(),
  website: z.string().max(0).optional(),
});

type Dependencies = {
  append: (value: NormalizedRSVP, submissionId: string, submittedAt: string) => Promise<void>;
  now?: () => string;
  rateLimit?: (request: Request) => Promise<boolean>;
};

function error(status: number, code: string): Response {
  return Response.json({ ok: false, code }, { status });
}

function hasAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const configured = process.env.RSVP_ALLOWED_ORIGIN?.trim();
  if (configured) return origin === configured;

  const url = new URL(request.url);
  if (origin === url.origin) return true;
  const host = request.headers.get("host");
  if (host && origin === `${url.protocol}//${host}`) return true;

  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(url.hostname)) {
    return origin === `${url.protocol}//localhost:${url.port}`
      || origin === `${url.protocol}//127.0.0.1:${url.port}`;
  }
  return false;
}

async function readBoundedBody(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, size).toString("utf8");
}

export function createRsvpHandler({ append, now = () => new Date().toISOString(), rateLimit }: Dependencies) {
  return async (request: Request): Promise<Response> => {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return error(415, "unsupported_media_type");
    if (!hasAllowedOrigin(request)) return error(403, "origin_not_allowed");
    const declaredLength = Number(request.headers.get("content-length"));
    if (declaredLength > 16_384) return error(413, "payload_too_large");
    let raw: string | null;
    try { raw = await readBoundedBody(request, 16_384); } catch { return error(400, "invalid_request"); }
    if (raw === null) return error(413, "payload_too_large");
    let input: unknown;
    try { input = JSON.parse(raw); } catch { return error(400, "invalid_json"); }
    const parsed = payloadSchema.safeParse(input);
    if (!parsed.success) return error(400, "invalid_rsvp");
    if (rateLimit && !(await rateLimit(request))) return error(429, "rate_limited");
    try {
      await append(normalizeRsvp(parsed.data), parsed.data.submissionId, now());
      return Response.json({ ok: true, submissionId: parsed.data.submissionId }, { status: 201 });
    } catch {
      return error(503, "save_unavailable");
    }
  };
}
