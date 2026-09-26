import { appendRsvpToConfiguredSheet } from "@/lib/server/googleSheets";
import { createRsvpHandler } from "@/lib/server/submitRsvp";
import { createLocalRsvpRateLimit } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const POST = createRsvpHandler({
  append: appendRsvpToConfiguredSheet,
  rateLimit: createLocalRsvpRateLimit(),
});
