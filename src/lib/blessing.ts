import * as z from "zod";

const thaiDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):00\+07:00$/;

function validThailandTime(value: string): boolean {
  const match = thaiDateTime.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month
    && date.getUTCDate() === day && date.getUTCHours() === hour && date.getUTCMinutes() === minute;
}

export const blessingSchema = z.object({
  blessingId: z.uuid(),
  submissionId: z.uuid(),
  name: z.string().trim().min(2).max(100),
  amount: z.string().regex(/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/).refine((value) => {
    const [baht, satang = ""] = value.split(".");
    const cents = Number(baht) * 100 + Number(satang.padEnd(2, "0"));
    return cents > 0 && cents <= 99_999_999 && Number.isSafeInteger(cents);
  }),
  transferredAt: z.string().refine(validThailandTime),
  website: z.string().max(0).optional(),
});

export type BlessingPayload = z.infer<typeof blessingSchema>;
export type NormalizedBlessing = Pick<BlessingPayload, "blessingId" | "submissionId" | "name" | "transferredAt"> & { amountThb: number };

export function isBlessingAmountInput(value: string): boolean {
  return /^(?:|0(?:\.\d{0,2})?|[1-9]\d{0,5}(?:\.\d{0,2})?)$/.test(value);
}

export function normalizeBlessing(input: BlessingPayload): NormalizedBlessing {
  const value = blessingSchema.parse(input);
  return { blessingId: value.blessingId, submissionId: value.submissionId,
    name: value.name, transferredAt: value.transferredAt, amountThb: Number(value.amount) };
}

export function thailandNowLocal(now: Date = new Date()): string {
  return new Date(now.getTime() + 7 * 60 * 60_000).toISOString().slice(0, 16);
}

export function thailandLocalToIso(value: string, now?: Date): string {
  const result = `${value}:00+07:00`;
  if (!validThailandTime(result)) throw new Error("Enter a valid Thailand date and time");
  if (now && Date.parse(result) > now.getTime()) throw new Error("Transfer time cannot be in the future");
  return result;
}
