import { createBlessingHandler } from "@/lib/server/submitBlessing";
import { appendBlessing, findBlessingInSheet, getGoogleAccessToken, resolveRsvpFromSheet } from "@/lib/server/googleSheets";
import { createLocalRsvpRateLimit } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

const rateLimit = createLocalRsvpRateLimit();

export async function POST(request: Request): Promise<Response> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
  const rsvpTabName = process.env.GOOGLE_SHEETS_TAB_NAME ?? "";
  let token: Promise<string> | undefined;
  const options = async (tabName: string) => {
    if (!spreadsheetId || !rsvpTabName) throw new Error("Sheets destination is not configured");
    return { spreadsheetId, tabName, accessToken: await (token ??= getGoogleAccessToken()) };
  };
  return createBlessingHandler({
    rateLimit,
    resolveRsvp: async (id) => resolveRsvpFromSheet(id, await options(rsvpTabName)),
    findBlessing: async (id, submissionId) => findBlessingInSheet(id, submissionId, await options("Blessing")),
    append: async (value, recordedAt) => appendBlessing(value, recordedAt, await options("Blessing")),
  })(request);
}
