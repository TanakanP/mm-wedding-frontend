import * as z from "zod";

const guestCount = z.string().optional();

export const rsvpSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  side: z.enum(["groom", "bride"], { message: "Please select whose side you are from" }),
  relation: z.string().trim().min(1, "Please enter your relationship").max(200),
  attending: z.enum(["yes", "no"], { message: "Please select if you are attending" }),
  guestCount,
  drinksAlcohol: z.boolean().optional(),
  message: z.string().trim().max(2000).optional(),
}).superRefine((value, context) => {
  if (value.attending !== "yes") return;
  const count = value.guestCount?.trim() || "0";
  if (!/^(0|[1-9]\d*)$/.test(count) || !Number.isSafeInteger(Number(count) + 1)) {
    context.addIssue({ code: "custom", path: ["guestCount"], message: "Enter a whole number of additional guests" });
  }
});

export type RSVPFormValues = z.infer<typeof rsvpSchema>;

export type NormalizedRSVP = {
  name: string;
  side: "groom" | "bride";
  relation: string;
  attending: "yes" | "no";
  additionalGuests: number;
  totalAttendees: number;
  drinksAlcohol: boolean;
  message: string;
};

export function getRelationshipLabel(side: "groom" | "bride"): string {
  return side === "groom"
    ? "Relationship (SKR, CPE, TechX, etc.)"
    : "Relationship (SATIT KKU, BAA, EY, SIX, NEX, etc.)";
}

export function normalizeRsvp(value: RSVPFormValues): NormalizedRSVP {
  const additionalGuests = value.attending === "yes" ? Number(value.guestCount?.trim() || "0") : 0;
  return {
    name: value.name,
    side: value.side,
    relation: value.relation,
    attending: value.attending,
    additionalGuests,
    totalAttendees: value.attending === "yes" ? additionalGuests + 1 : 0,
    drinksAlcohol: value.attending === "yes" && Boolean(value.drinksAlcohol),
    message: value.message ?? "",
  };
}
