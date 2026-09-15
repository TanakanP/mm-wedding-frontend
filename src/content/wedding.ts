export const V4_SECTION_IDS = [
  "hero",
  "families",
  "framed-photo",
  "dress-code",
  "schedule",
  "gallery",
  "venue",
  "final-image",
  "rsvp",
] as const;

export const SECTION_IDS = [...V4_SECTION_IDS, "garden-whispers"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_ITEMS = [
  { id: "families", label: "Invitation" },
  { id: "schedule", label: "Schedule" },
  { id: "gallery", label: "Gallery" },
  { id: "venue", label: "Venue" },
  { id: "garden-whispers", label: "FAQ" },
] as const satisfies readonly { id: SectionId; label: string }[];

export const WEDDING = {
  couple: "M & M",
  dateIso: "2026-12-05T00:00:00",
  dateLabel: "5 December 2026",
  dateLong: "Saturday, December 5, 2026",
  timeLabel: "5:30 PM - Midnight",
  venue: {
    name: "The Garden Hiroen",
    receptionName: "The Grand Orchard Pavilion",
    address: "456 Celebration Lane, New York, NY",
    mapUrl: null as string | null,
    calendarUrl: null as string | null,
  },
  song: {
    title: "Forever and Ever and Always (The Softer Version)",
    audioUrl: "/audio/forever-and-ever-and-always.mp3" as string | null,
  },
  invitation: {
    brideName: "Natthida",
    groomName: "Tanakan",
    message:
      "We warmly invite you to share in the joy of our wedding day. Join us for a celebration of love, laughter, and the beginning of our forever.",
    hashtag: "#MeenToBeWithMi",
  },
  dressCode: {
    title: "An Enchanted Palette",
    description:
      "Dress for this special night with us in romantic attire, choosing soft, muted tones that feel elegant and joyful.",
    colors: [
      { label: "Apricot Peach", value: "#F5C19E" },
      { label: "Petal Blush", value: "#E3C8C0" },
      { label: "Mist Grey", value: "#C2C2BB" },
      { label: "Champagne Sand", value: "#E1D1BA" },
      { label: "Buttercream Yellow", value: "#ECDFA6" },
      { label: "Blue Mist", value: "#C3CECD" },
      { label: "Soft Sage", value: "#B4C1AE" },
    ],
  },
  story:
    "Some paths in life are wandered alone, and some are found together. Ours began in a quiet garden café, grew through seasons of laughter and patience, and led us here — to this day, surrounded by the people we love most. We are grateful you are part of our story.",
  schedule: [
    { time: "5:30 PM", description: "Reception begins" },
    { time: "Midnight", description: "Celebration concludes" },
  ],
} as const;

export const PHOTOS = {
  1: { id: 1, src: "/photos/display/1.jpeg", alt: "M and M smiling together in a close memory", objectPosition: "50% 45%" },
  2: { id: 2, src: "/photos/display/2.jpeg", alt: "M and M sharing an outdoor travel memory", objectPosition: "50% 45%" },
  3: { id: 3, src: "/photos/display/3.jpeg", alt: "M and M together with a mountain landscape", objectPosition: "50% 45%" },
  4: { id: 4, src: "/photos/display/4.jpeg", alt: "M and M enjoying a playful lakeside moment", objectPosition: "50% 45%" },
  5: { id: 5, src: "/photos/display/5.jpeg", alt: "M and M posing together in playful costumes", objectPosition: "50% 45%" },
  6: { id: 6, src: "/photos/display/6.jpeg", alt: "M and M standing together beside a misty garden path", objectPosition: "50% 45%" },
  7: { id: 7, src: "/photos/display/7.jpeg", alt: "M and M standing beneath warm autumn leaves", objectPosition: "50% 45%" },
  8: { id: 8, src: "/photos/display/8.jpeg", alt: "M and M sharing a candid moment together", objectPosition: "50% 45%" },
  9: { id: 9, src: "/photos/display/9.jpeg", alt: "M and M wearing witch hats together at an indoor restaurant", objectPosition: "50% 45%" },
  10: { id: 10, src: "/photos/display/10.jpeg", alt: "M and M together during a garden journey", objectPosition: "50% 45%" },
} as const;

export const EDITORIAL_PHOTO_IDS = [6, 1, 7, 2, 8, 3, 5, 4, 10, 9] as const;

export const V4_GALLERY_PHOTO_IDS = [8, 3, 5, 4] as const;
