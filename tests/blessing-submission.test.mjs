import assert from "node:assert/strict";
import test from "node:test";

import { blessingSchema, thailandLocalToIso } from "../src/lib/blessing.ts";
import { createBlessingHandler } from "../src/lib/server/submitBlessing.ts";
import { appendBlessing, buildBlessingRow, findBlessingInSheet, resolveRsvpFromSheet } from "../src/lib/server/googleSheets.ts";
import { postBlessing } from "../src/lib/blessingClient.ts";

const payload = {
  blessingId: "b1e5f6ac-683e-4ba6-9c74-06947aaef184",
  submissionId: "6cbcccee-cda6-4f9b-8c44-30a5d58def99",
  name: "มีน 😊",
  amount: "1000.50",
  transferredAt: "2026-12-05T18:30:00+07:00",
  website: "",
};

const request = (body = payload, origin = "https://wedding.example") => new Request("https://wedding.example/api/blessing", {
  method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body),
});

test("blessing validates baht, exact Thailand date, and original identity", () => {
  assert.equal(thailandLocalToIso("2026-12-05T18:30"), payload.transferredAt);
  assert.equal(blessingSchema.parse(payload).amount, "1000.50");
  for (const amount of ["0", "-1", "1.234", "1e3", "90071992547409.92"]) {
    assert.equal(blessingSchema.safeParse({ ...payload, amount }).success, false, amount);
  }
  for (const transferredAt of ["2026-02-30T18:30:00+07:00", "2026-12-05T18:30:00Z", "2026-12-05T18:30:00+08:00"]) {
    assert.equal(blessingSchema.safeParse({ ...payload, transferredAt }).success, false, transferredAt);
  }
  assert.equal(blessingSchema.safeParse({ ...payload, submissionId: "bad" }).success, false);
  assert.throws(() => thailandLocalToIso("2026-02-30T18:30"));
});

test("blessing amount accepts one satang through 999999.99 without leading zeros", async () => {
  const { isBlessingAmountInput } = await import("../src/lib/blessing.ts");
  for (const amount of ["0.01", "1", "999999.99"]) {
    assert.equal(blessingSchema.safeParse({ ...payload, amount }).success, true, amount);
    assert.equal(isBlessingAmountInput?.(amount), true, amount);
  }
  for (const amount of ["0", "0.00", "-1", "01", "0001.00", "1000000", "1000000.00", "999999.999"]) {
    assert.equal(blessingSchema.safeParse({ ...payload, amount }).success, false, amount);
  }
  for (const amount of ["-1", "01", "0001.00", "1000000", "1000000.00", "999999.999"]) {
    assert.equal(isBlessingAmountInput?.(amount), false, amount);
  }
  for (const amount of ["", "0", "0.", "1."]) assert.equal(isBlessingAmountInput?.(amount), true, amount);
});

test("Thailand picker limit uses UTC+7 and rejects a future minute", async () => {
  const { thailandNowLocal } = await import("../src/lib/blessing.ts");
  const now = new Date("2026-09-28T17:45:30.000Z");
  assert.equal(thailandNowLocal?.(now), "2026-09-29T00:45");
  assert.equal(thailandLocalToIso("2026-09-29T00:45", now), "2026-09-29T00:45:00+07:00");
  assert.throws(() => thailandLocalToIso("2026-09-29T00:46", now), /future/i);
});

test("blessing handler requires a saved decline and confirms one append", async () => {
  const writes = [];
  const handler = createBlessingHandler({
    resolveRsvp: async () => ({ name: "มีน 😊", attending: "no" }),
    findBlessing: async () => null,
    append: async (value) => { writes.push(value); },
    now: () => "2026-12-05T12:00:00.000Z",
  });
  const response = await handler(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, submissionId: payload.submissionId, blessingId: payload.blessingId });
  assert.equal(writes[0].name, "มีน 😊");
  assert.equal(writes[0].amountThb, 1000.5);
  assert.equal((await handler(request({ ...payload, name: "Different" }))).status, 409);
  assert.equal((await handler(request({ ...payload, amount: "0" }))).status, 400);
  assert.equal((await handler(request(payload, "https://evil.example"))).status, 403);
  assert.equal((await handler(request({ ...payload, website: "bot" }))).status, 400);
  assert.equal((await handler(request({ ...payload, transferredAt: "2027-01-01T00:00:00+07:00" }))).status, 400);
  assert.equal((await handler(request({ ...payload, transferredAt: "2026-12-05T19:01:00+07:00" }))).status, 400);
  assert.equal(writes.length, 1);
  const unknown = createBlessingHandler({ resolveRsvp: async () => null, findBlessing: async () => null, append: async () => assert.fail("no append"), now: () => "2026-12-05T12:00:00.000Z" });
  assert.equal((await unknown(request())).status, 404);
  const attending = createBlessingHandler({ resolveRsvp: async () => ({ name: payload.name, attending: "yes" }), findBlessing: async () => null, append: async () => assert.fail("no append"), now: () => "2026-12-05T12:00:00.000Z" });
  assert.equal((await attending(request())).status, 409);
});

test("matching blessing retry is safe and conflicting retry is rejected", async () => {
  const recorded = { ...payload, amountThb: 1000.5 };
  const handler = createBlessingHandler({
    resolveRsvp: async () => ({ name: payload.name, attending: "no" }),
    findBlessing: async () => recorded,
    append: async () => assert.fail("retry must not append"),
    now: () => "2026-12-05T12:00:00.000Z",
  });
  assert.equal((await handler(request())).status, 201);
  assert.equal((await handler(request({ ...payload, amount: "999" }))).status, 409);
  const duplicate = createBlessingHandler({
    resolveRsvp: async () => ({ name: payload.name, attending: "no" }),
    findBlessing: async () => ({ ...recorded, blessingId: "d77fb398-e8e1-4fc0-84ee-93677c273626" }),
    append: async () => assert.fail("second report must not append"),
    now: () => "2026-12-05T12:00:00.000Z",
  });
  assert.equal((await duplicate(request())).status, 409);
});

test("Blessing uses same spreadsheet with RAW A:F row and one-row confirmation", async () => {
  const value = { ...payload, amountThb: 1000.5 };
  assert.deepEqual(buildBlessingRow(value, "2026-12-05T12:00:00.000Z"), [payload.submissionId, payload.name, 1000.5, payload.transferredAt, "2026-12-05T12:00:00.000Z", payload.blessingId]);
  const calls = [];
  await appendBlessing(value, "2026-12-05T12:00:00.000Z", {
    spreadsheetId: "sheet123", tabName: "Blessing", accessToken: "token",
    fetcher: async (url, init) => { calls.push({ url, init }); return Response.json({ updates: { updatedRows: 1 } }); },
  });
  assert.match(calls[0].url, /'Blessing'!A%3AF/);
  assert.match(calls[0].url, /valueInputOption=RAW/);
  assert.equal(JSON.parse(calls[0].init.body).values[0][2], 1000.5);
  await assert.rejects(() => appendBlessing(value, "2026-12-05T12:00:00.000Z", {
    spreadsheetId: "sheet123", tabName: "Blessing", accessToken: "token",
    fetcher: async () => Response.json({ updates: { updatedRows: 0 } }),
  }));
});

test("sheet lookups bind a blessing to one saved declined RSVP", async () => {
  const calls = [];
  const fetcher = async (url) => {
    calls.push(url);
    return Response.json(url.includes("Blessing")
      ? { values: [["submission_id", "name", "amount_thb", "transferred_at", "recorded_at", "blessing_id"],
        [payload.submissionId, payload.name, "1000.5", payload.transferredAt, "2026-12-05T12:00:00Z", payload.blessingId]] }
      : { values: [["submission_id", "submitted_at", "name", "side", "relation", "attending"],
        [payload.submissionId, "2026-09-27T00:00:00Z", payload.name, "bride", "School", "no"]] });
  };
  const options = { spreadsheetId: "sheet123", tabName: "RSVP", accessToken: "token", fetcher };
  assert.deepEqual(await resolveRsvpFromSheet(payload.submissionId, options), { name: payload.name, attending: "no" });
  assert.equal((await findBlessingInSheet(payload.blessingId, payload.submissionId, options))?.amountThb, 1000.5);
  assert.equal((await findBlessingInSheet("different-id", payload.submissionId, options))?.blessingId, payload.blessingId);
  assert.match(calls[0], /'RSVP'!A%3AK/);
  assert.match(calls[1], /'Blessing'!A%3AF/);
});

test("a retried RSVP row resolves only when duplicate identity and attendance agree", async () => {
  const saved = [payload.submissionId, "2026-09-27T00:00:00Z", payload.name, "bride", "School", "no"];
  const options = (rows) => ({ spreadsheetId: "sheet123", tabName: "RSVP", accessToken: "token",
    fetcher: async () => Response.json({ values: [saved, ...rows] }) });
  assert.deepEqual(await resolveRsvpFromSheet(payload.submissionId, options([saved])), { name: payload.name, attending: "no" });
  assert.equal(await resolveRsvpFromSheet(payload.submissionId, options([[...saved.slice(0, 5), "yes"]])), null);
  assert.equal(await resolveRsvpFromSheet(payload.submissionId, options([[saved[0], saved[1], "Other guest", ...saved.slice(3)]])), null);
});

test("client accepts only matching blessing confirmation", async () => {
  await postBlessing(payload, async () => Response.json({ ok: true, submissionId: payload.submissionId, blessingId: payload.blessingId }, { status: 201 }));
  await assert.rejects(() => postBlessing(payload, async () => Response.json({ ok: true, submissionId: payload.submissionId, blessingId: "other" }, { status: 201 })));
});
