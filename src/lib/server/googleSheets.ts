import { createSign } from "node:crypto";
import type { NormalizedRSVP } from "../rsvp";

type SheetCell = string | number | boolean;
type Fetcher = typeof fetch;

export type SheetsOptions = {
  spreadsheetId: string;
  tabName: string;
  accessToken: string;
  fetcher?: Fetcher;
};

export function buildRsvpRow(value: NormalizedRSVP, submissionId: string, submittedAt: string): SheetCell[] {
  return [submissionId, submittedAt, value.name, value.side, value.relation, value.attending,
    value.additionalGuests, value.totalAttendees, value.drinksAlcohol, value.message, 1];
}

export async function appendRsvp(value: NormalizedRSVP, submissionId: string, submittedAt: string, options: SheetsOptions): Promise<void> {
  const { spreadsheetId, tabName, accessToken, fetcher = fetch } = options;
  if (!spreadsheetId || !tabName || !accessToken) throw new Error("Sheets configuration is incomplete");
  const range = `'${tabName.replaceAll("'", "''")}'!A:K`;
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append`);
  url.searchParams.set("valueInputOption", "RAW");
  url.searchParams.set("insertDataOption", "INSERT_ROWS");
  const response = await fetcher(url.toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ range, majorDimension: "ROWS", values: [buildRsvpRow(value, submissionId, submittedAt)] }),
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Sheets append failed (${response.status})`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("updates" in result) ||
    !result.updates || typeof result.updates !== "object" ||
    !("updatedRows" in result.updates) || result.updates.updatedRows !== 1) {
    throw new Error("Sheets did not confirm one row");
  }
}

export async function getGoogleAccessToken(fetcher: Fetcher = fetch): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replaceAll("\\n", "\n");
  if (!email || !privateKey) throw new Error("Google service account credentials are not configured");
  const now = Math.floor(Date.now() / 1000);
  const base64url = (value: string) => Buffer.from(value).toString("base64url");
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: email, scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(privateKey).toString("base64url")}`;
  const response = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google authentication failed (${response.status})`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("access_token" in data) || typeof data.access_token !== "string") {
    throw new Error("Google authentication returned no access token");
  }
  return data.access_token;
}

export async function appendRsvpToConfiguredSheet(value: NormalizedRSVP, submissionId: string, submittedAt: string): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tabName = process.env.GOOGLE_SHEETS_TAB_NAME;
  if (!spreadsheetId || !tabName) throw new Error("Sheets destination is not configured");
  const accessToken = await getGoogleAccessToken();
  await appendRsvp(value, submissionId, submittedAt, { spreadsheetId, tabName, accessToken });
}
