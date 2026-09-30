import assert from "node:assert/strict";
import test from "node:test";

import { getRelationshipLabel, rsvpSchema, normalizeRsvp } from "../src/lib/rsvp.ts";
import { createRsvpHandler } from "../src/lib/server/submitRsvp.ts";
import { appendRsvp, buildRsvpRow, getGoogleAccessToken } from "../src/lib/server/googleSheets.ts";
import { generateKeyPairSync, createVerify } from "node:crypto";
import { createLocalRsvpRateLimit } from "../src/lib/server/rateLimit.ts";
import { postRsvp } from "../src/lib/rsvpClient.ts";

const valid = {
  submissionId: "6cbcccee-cda6-4f9b-8c44-30a5d58def99",
  name: " มีน 😊 ",
  side: "bride",
  relation: " =1+1 ",
  attending: "yes",
  guestCount: "2",
  drinksAlcohol: true,
  message: " ยินดีด้วย 🎉 ",
  website: "",
};

const relationshipLabel = "Relationship (Family, School, University, Work, etc.)";

test("relationship label is the same for both sides and free text is trimmed", () => {
  assert.equal(getRelationshipLabel("groom"), relationshipLabel);
  assert.equal(getRelationshipLabel("bride"), relationshipLabel);
  assert.equal(rsvpSchema.safeParse({ ...valid, relation: "   " }).success, false);
  assert.equal(rsvpSchema.parse(valid).relation, "=1+1");
});

test("name, relationship, note, and additional guests stay inside the RSVP limits", () => {
  const name100 = "ก".repeat(100);
  const relation100 = ` ${"a".repeat(100)} `;
  const message500 = ` ${"b".repeat(500)} `;
  assert.equal(rsvpSchema.safeParse({ ...valid, name: "Ab" }).success, true);
  assert.equal(rsvpSchema.safeParse({ ...valid, name: name100, relation: relation100, message: message500, guestCount: "99" }).success, true);
  assert.equal(rsvpSchema.parse({ ...valid, name: `  ${name100}  `, relation: relation100, message: message500 }).message, "b".repeat(500));
  for (const guestCount of ["", "0", "99"]) {
    assert.equal(rsvpSchema.safeParse({ ...valid, guestCount }).success, true, guestCount);
  }
  assert.equal(rsvpSchema.safeParse({ ...valid, name: "a" }).success, false);
  assert.equal(rsvpSchema.safeParse({ ...valid, name: "a".repeat(101) }).success, false);
  assert.equal(rsvpSchema.safeParse({ ...valid, relation: "r".repeat(101) }).success, false);
  assert.equal(rsvpSchema.safeParse({ ...valid, message: "m".repeat(501) }).success, false);
  for (const guestCount of ["100", "-1", "1.5", "1e2"]) {
    assert.equal(rsvpSchema.safeParse({ ...valid, guestCount }).success, false, guestCount);
  }
  const declined = normalizeRsvp(rsvpSchema.parse({ ...valid, attending: "no", guestCount: "100" }));
  assert.equal(declined.additionalGuests, 0);
  assert.equal(declined.totalAttendees, 0);
});

test("normalization counts additional guests and removes stale declining values", () => {
  assert.deepEqual(normalizeRsvp(rsvpSchema.parse(valid)), {
    name: "มีน 😊", side: "bride", relation: "=1+1", attending: "yes",
    additionalGuests: 2, totalAttendees: 3, drinksAlcohol: true, message: "ยินดีด้วย 🎉",
  });
  assert.deepEqual(normalizeRsvp(rsvpSchema.parse({ ...valid, attending: "no" })), {
    name: "มีน 😊", side: "bride", relation: "=1+1", attending: "no",
    additionalGuests: 0, totalAttendees: 0, drinksAlcohol: false, message: "ยินดีด้วย 🎉",
  });
  for (const guestCount of ["-1", "1.5", "abc", "9007199254740992"]) {
    assert.equal(rsvpSchema.safeParse({ ...valid, guestCount }).success, false, guestCount);
  }
});

test("row ordering keeps formula-like text literal", () => {
  const row = buildRsvpRow(normalizeRsvp(rsvpSchema.parse(valid)), valid.submissionId, "2026-09-26T00:00:00.000Z");
  assert.deepEqual(row, [valid.submissionId, "2026-09-26T00:00:00.000Z", "มีน 😊", "bride", "=1+1", "yes", 2, 3, true, "ยินดีด้วย 🎉", 1]);
});

test("Sheets append uses RAW and succeeds only for one confirmed row", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ updates: { updatedRows: 1 } }), { status: 200 });
  };
  await appendRsvp(normalizeRsvp(rsvpSchema.parse(valid)), valid.submissionId, "2026-09-26T00:00:00.000Z", {
    spreadsheetId: "sheet123", tabName: "RSVP", accessToken: "token", fetcher,
  });
  assert.match(calls[0].url, /valueInputOption=RAW/);
  assert.match(calls[0].url, /insertDataOption=INSERT_ROWS/);
  assert.match(calls[0].url, /'RSVP'!A%3AK/);
  assert.equal(calls[0].init.headers.Authorization, "Bearer token");
  assert.equal(JSON.parse(calls[0].init.body).values[0][4], "=1+1");
  await assert.rejects(() => appendRsvp(normalizeRsvp(rsvpSchema.parse(valid)), valid.submissionId, "2026-09-26T00:00:00.000Z", {
    spreadsheetId: "sheet123", tabName: "RSVP", accessToken: "token",
    fetcher: async () => new Response(JSON.stringify({ updates: { updatedRows: 0 } }), { status: 200 }),
  }));
});

test("service account signs a scoped JWT without exposing the private key", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const savedEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const savedKey = process.env.GOOGLE_PRIVATE_KEY;
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "writer@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  try {
    const token = await getGoogleAccessToken(async (url, options) => {
      assert.equal(url, "https://oauth2.googleapis.com/token");
      const [header, claims, signature] = options.body.get("assertion").split(".");
      const verifier = createVerify("RSA-SHA256");
      verifier.update(`${header}.${claims}`);
      assert.equal(verifier.verify(privateKey, Buffer.from(signature, "base64url")), true);
      assert.equal(JSON.parse(Buffer.from(claims, "base64url")).scope, "https://www.googleapis.com/auth/spreadsheets");
      return new Response(JSON.stringify({ access_token: "short-lived-token" }), { status: 200 });
    });
    assert.equal(token, "short-lived-token");
  } finally {
    if (savedEmail === undefined) delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = savedEmail;
    if (savedKey === undefined) delete process.env.GOOGLE_PRIVATE_KEY;
    else process.env.GOOGLE_PRIVATE_KEY = savedKey;
  }
});

test("handler validates request before writing, and reports storage failure", async () => {
  let writes = 0;
  const handler = createRsvpHandler({
    append: async () => { writes++; },
    now: () => "2026-09-26T00:00:00.000Z",
  });
  const request = (body, headers = {}) => new Request("https://wedding.example/api/rsvp", {
    method: "POST", headers: { "content-type": "application/json", origin: "https://wedding.example", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  for (const bad of [
    { ...valid, submissionId: "bad" }, { ...valid, side: "other" },
    { ...valid, relation: "  " }, { ...valid, website: "bot" },
  ]) {
    const result = await handler(request(bad));
    assert.equal(result.status, 400);
  }
  assert.equal(writes, 0);
  assert.equal((await handler(request(valid, { origin: "https://evil.example" }))).status, 403);
  assert.equal((await handler(request(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await handler(request("x".repeat(17_000)))).status, 413);
  assert.equal(writes, 0);
  for (const bad of [
    { ...valid, name: "n".repeat(101) },
    { ...valid, relation: "r".repeat(101) },
    { ...valid, message: "m".repeat(501) },
    { ...valid, guestCount: "100" },
    { ...valid, guestCount: "-1" },
    { ...valid, guestCount: "1.5" },
    { ...valid, guestCount: "1e2" },
  ]) {
    assert.equal((await handler(request(bad))).status, 400);
  }
  assert.equal(writes, 0);
  const success = await handler(request(valid));
  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), { ok: true, submissionId: valid.submissionId });
  assert.equal(writes, 1);
  const saved = [];
  const bounded = createRsvpHandler({ append: async (value) => { saved.push(value); } });
  assert.equal((await bounded(request({ ...valid, attending: "no", guestCount: "100" }))).status, 201);
  assert.equal(saved[0].additionalGuests, 0);
  assert.equal(saved[0].totalAttendees, 0);
  assert.equal(saved[0].drinksAlcohol, false);
  const blocked = createRsvpHandler({ append: async () => { writes++; }, rateLimit: async () => false });
  assert.equal((await blocked(request(valid))).status, 429);
  assert.equal(writes, 1);
  const failing = createRsvpHandler({ append: async () => { throw new Error("permission denied"); } });
  const failure = await failing(request(valid));
  assert.equal(failure.status, 503);
  assert.equal((await failure.json()).ok, false);
});

test("localhost request accepts the browser origin on the forwarded host", async () => {
  let writes = 0;
  const handler = createRsvpHandler({ append: async () => { writes++; } });
  const request = new Request("http://localhost:3000/api/rsvp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://127.0.0.1:3000",
      host: "127.0.0.1:3000",
    },
    body: JSON.stringify(valid),
  });
  assert.equal((await handler(request)).status, 201);
  assert.equal(writes, 1);
});

test("configured public origin still rejects a different host", async () => {
  const saved = process.env.RSVP_ALLOWED_ORIGIN;
  process.env.RSVP_ALLOWED_ORIGIN = "https://wedding.example";
  try {
    const handler = createRsvpHandler({ append: async () => assert.fail("must not write") });
    const request = new Request("http://localhost:3000/api/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" },
      body: JSON.stringify(valid),
    });
    assert.equal((await handler(request)).status, 403);
  } finally {
    if (saved === undefined) delete process.env.RSVP_ALLOWED_ORIGIN;
    else process.env.RSVP_ALLOWED_ORIGIN = saved;
  }
});

test("oversized streamed requests stop reading after the limit", async () => {
  let pulls = 0;
  const stream = new ReadableStream({
    pull(controller) {
      pulls++;
      controller.enqueue(new TextEncoder().encode("x".repeat(1024)));
      if (pulls === 100) controller.close();
    },
  });
  const request = new Request("https://wedding.example/api/rsvp", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://wedding.example" },
    body: stream,
    duplex: "half",
  });
  const handler = createRsvpHandler({ append: async () => assert.fail("must not write") });
  assert.equal((await handler(request)).status, 413);
  assert.ok(pulls < 100, `read ${pulls} chunks`);
});

test("local limiter caps repeated IP and total requests within a minute", async () => {
  let now = 0;
  const limit = createLocalRsvpRateLimit({ now: () => now, perIp: 2, total: 3 });
  const request = (ip) => new Request("https://wedding.example/api/rsvp", { headers: { "x-forwarded-for": ip } });
  assert.equal(await limit(request("1.1.1.1")), true);
  assert.equal(await limit(request("1.1.1.1")), true);
  assert.equal(await limit(request("1.1.1.1")), false);
  assert.equal(await limit(request("2.2.2.2")), true);
  assert.equal(await limit(request("3.3.3.3")), false);
  now = 61_000;
  assert.equal(await limit(request("1.1.1.1")), true);
});

test("browser submit accepts only a matching confirmed save", async () => {
  let sent;
  const good = async (url, options) => {
    sent = { url, options };
    return new Response(JSON.stringify({ ok: true, submissionId: valid.submissionId }), { status: 201 });
  };
  await postRsvp(valid, valid.submissionId, good);
  assert.equal(sent.url, "/api/rsvp");
  assert.equal(JSON.parse(sent.options.body).relation, " =1+1 ");
  await postRsvp(valid, valid.submissionId, good, "bot-filled");
  assert.equal(JSON.parse(sent.options.body).website, "bot-filled");
  for (const response of [
    new Response(JSON.stringify({ ok: false }), { status: 503 }),
    new Response(JSON.stringify({ ok: true, submissionId: "wrong" }), { status: 201 }),
    new Response("not-json", { status: 201 }),
  ]) {
    await assert.rejects(() => postRsvp(valid, valid.submissionId, async () => response));
  }
  await assert.rejects(() => postRsvp(valid, valid.submissionId, async () => { throw new TypeError("offline"); }));
});
