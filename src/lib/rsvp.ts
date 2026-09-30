import * as z from "zod";

const guestCount = z.string().optional();

export const rsvpSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  side: z.enum(["groom", "bride"], { message: "Please select whose side you are from" }),
  relation: z.string().trim().min(1, "Please enter your relationship").max(100),
  attending: z.enum(["yes", "no"], { message: "Please select if you are attending" }),
  guestCount,
  drinksAlcohol: z.boolean().optional(),
  message: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.attending !== "yes") return;
  const count = value.guestCount?.trim() || "0";
  if (!/^(0|[1-9]\d*)$/.test(count) || !Number.isSafeInteger(Number(count) + 1)) {
    context.addIssue({ code: "custom", path: ["guestCount"], message: "Enter a whole number of additional guests" });
    return;
  }
  if (Number(count) > 99) {
    context.addIssue({ code: "custom", path: ["guestCount"], message: "Additional guests must be between 0 and 99" });
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
  switch (side) {
    case "groom":
    case "bride":
      return "Relationship (Family, School, University, Work, etc.)";
  }
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
