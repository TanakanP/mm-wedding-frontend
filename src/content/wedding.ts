// photo-blurs:start
const photoBlurs = {
  "/photos/display/page/opening-background-expanded.webp": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAADwAwCdASoLABgAPu1kqU2ppaOiMAgBMB2JYwC06BwudG+DO7NnYO8AAP7dbvO3DItbC2B6vKvE3a/kehL9GXo0b36JJKvANtFjwcmSr/XXdjyrrw0OmJLV9/7UGuCAvf1tlJiqmOMMu0AA",
  "/photos/display/page/opening-envelope.webp": "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAABwBACdASoQABgAPu1iqU2ppaQiMAgBMB2JQBOgMYib0dwBgeTZaWzSe4LiUAD+6R7eO10FL2bQEP3QuM83iuSRN1YPTwy1vK9NSwTY4chuesN7OJPjTEIJNPg3sxKzntmPWt2UDmV9gl4/YKlS5VdHHwmMnfWMhL/Ps8PXNKHK2jf5O2aGSxVlHwVa5kpVwiKkaF2PS6d8mgrEog7vQJEAwdwAAA==",
  "/photos/display/page/framed-background-running.webp": "data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAABQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQAB8kDEfYy45TpoY5x2qploAAP7x4NbDT88Weqaj4dC4cj/5CIQEUUoj/DoUg5qmx0a2E7y0FwwE86s6DZvq3vmRlrALXL92peSqi67X0kOQjv0yMpqdM7Tkjmn7nsRVOOJsWmgjy70A4boWdnJniunjwsOdWiZFE+bWHiRkmdA8f2DKAHtYCKwuAAAA",
  "/photos/display/page/framed-center-piggyback.webp": "data:image/webp;base64,UklGRsAAAABXRUJQVlA4ILQAAACwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBWGUGeV2ATmIjDR9tvBlu958vAiAP7uNDEozawD6Wm6IbvEqlkElJPtCoi8G9xucXEDZ3TSLJKCEkFAtAlOGtoCr6dNizBAT86PM9Oxm7Z2JCha4NH2uS2LG1aZd0fLb5VMtBq5EGbeOoe0wKovooiO9Y0O86xerYepaoXf5Zp5LqZrBQQXhrEuY13J80kW47Nn6c/87r9gAAA=",
  "/photos/display/page/gallery-1-bench.webp": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAACwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOgMXrdrTMkRe96RUEt4iRzN2dwAP7sPu29bOAVha1i4eANA2baJ65uNAZ6V+O/pxBXCvxRmoqUiTcT1fsmlfSeRHkHp60Hpi3+7i4qnGzJtUgW6Hxepq/GKZeTnagJfrudI+wfoWrPsREnKUgFqQ+HdqV+AiUlny/u6DNXkcnqwec5A5M2tuLnieIod8y9nUCFqjWKRDpTMABFHFnBECWgAA==",
  "/photos/display/page/gallery-2-embrace.webp": "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAABwBACdASoPABgAPu1iqU2ppaOiMAgBMB2JQBOgMXmcpi5r8fRlGQVCEE8gyAD+7tfEYsRTkYac/Xitb1UFigdV4B/rzwtkcKh7na5rmBTb9wRM62UD41RqJ56T6X8DOHO+0pt4j/DjkcXLsdvdVm6C3vDT087Q4ueB4Dn5/8b3UvpUDbb8z/xUHk+WlU5Y63tuer6D/vaY7hkr7vetGrpemgAAAA==",
  "/photos/display/page/gallery-3-rings.webp": "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAABQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOgMYsZW+abL5P3Qqi2UNzgAP7jT52IMOowKP9/RvRPcyFk8t7/YqvPTb1Z7PveuD/0p18UVy3vkwzSA/QxLZYYfrrYV/fiX22poPVXjBHQPNpYdCvTpy4ACXmC4r+2jtmse+4cIN3LdyqlHgMYGckTttqedmOjWlxCEOIAAA==",
  "/photos/display/page/gallery-4-lakeside.webp": "data:image/webp;base64,UklGRsIAAABXRUJQVlA4ILYAAABwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JYwCdB3gGyiMJPNmHyIsw8J3gAAD+6VCE2cyD0zNRd4tjp5+WPuQvExCu2hlbhrAB54bwMF4JIDPa1knR8QuGJaeNieHJnfr62Cf4t/mMXA28cTH0cgT4yGpu3u+eF37Ljkz9gEiia7Kh/4rAvZf1vNt/IONQNps7Bem0v/ORZzy/T2F+v323B97Z2RAgRbSPsX6+jYNkp5Np0nkAAA==",
  "/photos/display/page/final-memory-running.webp": "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAAAwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JaQAD5aH38gJERcROB6Z8vpgA/SmSt0aWKocAU0ncP5A3qLAv/27+HEwilorl03VITxcySfgGtl+DRyxIfG4RGwca1ewXYWt9k3fy44ofn7GwOYbG7DAMQmGVvTa57KMtxmEA77JB7qwdUAAAAA==",
  "/photos/display/page/rsvp-background.webp": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAAAQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOmUABwUJ4+4X3FLuausAD+7yDTbhFaTKrymi0RoOx9Q1mTHTlYhH05P3fYtV9oBgiuf007YgBhaOI0CdAsUbDRnS7XSO935I7Qtn6VwVOKJGluhlPQQk4WTrexEd6TccrNxIRvbbYCokp+RzgA",
  "/photos/display/page/ornate-ivory.webp": "data:image/webp;base64,UklGRpIBAABXRUJQVlA4WAoAAAAQAAAAEAAAFwAAQUxQSPoAAAANgGpr22Ll/f9/Zg7u7g7Jo7t7gsgduGWHSrTOopKcRvLk7u7OPx82c24hIiYgK875ajZ4uyXpoPeNUdWEuByEWyaFAkHNtkSysEP9ertWpPLGdQsxKO5fSZiu1YXUdP4J8dxUlzhW7PKoA4R/P9WRUDyAwZCAYAECGUHnfmsBbh8wybFQgguYJVa+FqN+mgFWOcwzPDXjy4p6AWuVnnb10wyx/hc7WMli8WGKWOJ4qu+LGY7RGFzBrBTxTw5cF0ZS4PHEzl1KIxA7LcBbCif2Dz1eoXo+srATxq5fmNMk6F19twM+wHULfNQai+1EwFF9wv3AkcUuezwZVlA4IHIAAAAwBACdASoRABgAPu1iqU2ppaOiMAgBMB2JYgDH5CHf+J1Q5sASmjUK7AQA/u/RUqDDFOIUFqvSsz4lQQzo71FGIzZ01FwH+LYfrPRXq+f/2EsEPK3lxo3BPSnzQ+6LPzMkV3rzYABeNyU17H6qrMoAAAA="
} as const;

// photo-blurs:end
export const V4_SECTION_IDS = [
  "hero",
  "families",
  "dress-code",
  "framed-photo",
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
] as const satisfies readonly { id: SectionId; label: string }[];

export const WEDDING = {
  couple: "M & M",
  dateIso: "2026-12-05T00:00:00",
  dateLabel: "5 December 2026",
  dateLong: "Saturday, December 5, 2026",
  timeLabel: "5:00 PM - 9:00 PM",
  venue: {
    name: "US Wedding & Event VENUE",
    address: "Khlong Khwai, Sam Khok, Pathum Thani",
    mapUrl: "https://maps.app.goo.gl/WSErDmemgpuem54U9",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.606763303097!2d100.47448461109575!3d14.100375589069891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e27d8e5801262b%3A0xbd0cf5d1c8df6f8a!2sUs%20Wedding%20%26%20Event%20VENUE!5e0!3m2!1sth!2sth!4v1789834939731!5m2!1sth!2sth",
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
    {
      time: "5:00 PM",
      description: "Feast & Photography",
      icon: "feastPhotography",
    },
    {
      time: "6:00 PM",
      description: "Wedding Reception",
      icon: "reception",
    },
  ],
} as const;

export const OPENING_PHOTOS = {
  envelope: {
    src: "/photos/display/page/opening-envelope.webp",
    alt: "Natthida and Tanakan showing their engagement rings together",
    objectPosition: "50% 40%",
    blurDataURL: photoBlurs["/photos/display/page/opening-envelope.webp"],
  },
  background: {
    src: "/photos/display/page/opening-background-expanded.webp",
    alt: "Natthida and Tanakan sitting together beside a quiet lake",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/opening-background-expanded.webp"],
  },
} as const;

export const FRAMED_PHOTOS = {
  background: {
    src: "/photos/display/page/framed-background-running.webp",
    alt: "",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/framed-background-running.webp"],
  },
  center: {
    src: "/photos/display/page/framed-center-piggyback.webp",
    alt: "Natthida smiling while riding on Tanakan's back",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/framed-center-piggyback.webp"],
  },
  frame: {
    src: "/photos/display/page/ornate-ivory.webp",
    alt: "",
    blurDataURL: photoBlurs["/photos/display/page/ornate-ivory.webp"],
  },
} as const;

export const GALLERY_PHOTOS = [
  {
    src: "/photos/display/page/gallery-2-embrace.webp",
    alt: "Natthida smiling at Tanakan as he lifts her among the trees",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/gallery-2-embrace.webp"],
  },
  {
    src: "/photos/display/page/gallery-1-bench.webp",
    alt: "Natthida and Tanakan sitting together on a garden bench",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/gallery-1-bench.webp"],
  },
  {
    src: "/photos/display/page/gallery-3-rings.webp",
    alt: "Natthida and Tanakan holding up their wedding rings",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/gallery-3-rings.webp"],
  },
  {
    src: "/photos/display/page/gallery-4-lakeside.webp",
    alt: "Tanakan looking toward Natthida beside the lake",
    objectPosition: "50% 50%",
    blurDataURL: photoBlurs["/photos/display/page/gallery-4-lakeside.webp"],
  },
] as const;

export const PHOTOS = {
  1: { id: 1, src: "/photos/display/1.jpeg", alt: "M and M smiling together in a close memory", objectPosition: "50% 45%" },
  2: { id: 2, src: "/photos/display/2.jpeg", alt: "M and M sharing an outdoor travel memory", objectPosition: "50% 45%" },
  3: { id: 3, src: "/photos/display/3.jpeg", alt: "M and M together with a mountain landscape", objectPosition: "50% 45%" },
  4: { id: 4, src: "/photos/display/4.jpeg", alt: "M and M enjoying a playful lakeside moment", objectPosition: "50% 45%" },
  5: { id: 5, src: "/photos/display/5.jpeg", alt: "M and M posing together in playful costumes", objectPosition: "50% 45%" },
  6: { id: 6, src: "/photos/display/page/rsvp-background.webp", alt: "Natthida and Tanakan holding hands on stone garden steps", objectPosition: "50% 62%", blurDataURL: photoBlurs["/photos/display/page/rsvp-background.webp"] },
  7: { id: 7, src: "/photos/display/7.jpeg", alt: "M and M standing beneath warm autumn leaves", objectPosition: "50% 45%" },
  8: { id: 8, src: "/photos/display/8.jpeg", alt: "M and M sharing a candid moment together", objectPosition: "50% 45%" },
  9: { id: 9, src: "/photos/display/page/final-memory-running.webp", alt: "Natthida and Tanakan running together through the garden", objectPosition: "50% 50%", blurDataURL: photoBlurs["/photos/display/page/final-memory-running.webp"] },
  10: { id: 10, src: "/photos/display/10.jpeg", alt: "M and M together during a garden journey", objectPosition: "50% 45%" },
  11: { id: 11, src: "/photos/display/11.jpeg", alt: "Natthida and Tanakan running hand in hand through a flower garden", objectPosition: "50% 50%" },
  12: { id: 12, src: "/photos/display/12.jpeg", alt: "Natthida smiling while riding on Tanakan's back", objectPosition: "50% 42%" },
} as const;

export const EDITORIAL_PHOTO_IDS = [6, 1, 7, 2, 8, 3, 5, 4, 10, 9] as const;

export const V4_GALLERY_PHOTO_IDS = [8, 3, 5, 4] as const;

// Six optimized grayscale photographs, mixed independently across each strip.
// Identical group copies preserve seamless loops without extra image downloads.
import preparedFilmPhotos from './rsvpFilmPhotos.json' with { type: 'json' };
export const RSVP_FILM_PHOTOS = preparedFilmPhotos.map((photo, index) => ({
  ...photo,
  id: `rsvp-film-${String(index + 1).padStart(2, '0')}`,
}));
