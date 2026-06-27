export const STORY_TITLE = "Our Story";

export const STORY_LETTER =
  "Some paths in life are wandered alone, and some are found together. Ours began in a quiet garden café, grew through seasons of laughter and patience, and led us here — to this day, surrounded by the people we love most. We are grateful you are part of our story.";

export const EASE = [0.23, 1, 0.32, 1] as const;

export type Phase = "waiting" | "letter" | "typing" | "photos" | "done";

export type LetterPhase = "hidden" | "empty" | "typing" | "complete";

export const TIMING = {
  letterAppear: 500,
  letterAppearHold: 400,
  typeTitleSpeed: 28,
  typeBodySpeed: 14,
  photoStagger: 280,
  carouselDuration: 28,
} as const;

export type PhotoSize = "sm" | "md" | "lg";

export type PhotoPlacement = {
  id: number;
  rotation: number;
  position: string;
  gradient: [string, string];
  alt: string;
  size?: PhotoSize;
};

export const PHOTO_SIZE_CLASS: Record<PhotoSize, string> = {
  sm: "w-[92px] h-[115px] md:w-[124px] md:h-[155px]",
  md: "w-[108px] h-[135px] md:w-[152px] md:h-[190px]",
  lg: "w-[120px] h-[150px] md:w-[172px] md:h-[215px]",
};

export const PHOTO_PLACEMENTS: PhotoPlacement[] = [
  {
    id: 1,
    rotation: -5,
    position: "-top-14 -left-[6.5rem] md:-top-[6.5rem] md:-left-[1.25rem]",
    gradient: ["#c48a7f", "#4a664f"],
    alt: "Our moment 1",
    size: "md",
  },
  {
    id: 2,
    rotation: 6,
    position: "top-8 -right-[7rem] md:top-6 md:-right-[5rem]",
    gradient: ["#b89e68", "#a36e6a"],
    alt: "Our moment 2",
    size: "md",
  },
  {
    id: 3,
    rotation: 3,
    position: "-bottom-16 -left-12 md:-bottom-[5.5rem] md:-left-[5.5rem]",
    gradient: ["#4a664f", "#c48a7f"],
    alt: "Our moment 3",
    size: "md",
  },
  {
    id: 4,
    rotation: 11,
    position: "-top-10 -left-[11.5rem] md:-top-10 md:-left-[19rem]",
    gradient: ["#a36e6a", "#4a664f"],
    alt: "Our moment 4",
    size: "lg",
  },
  {
    id: 5,
    rotation: -9,
    position: "top-[64%] -left-[13rem] md:-left-[25rem]",
    gradient: ["#c48a7f", "#b89e68"],
    alt: "Our moment 5",
    size: "md",
  },
  {
    id: 6,
    rotation: -7,
    position: "-top-[4.5rem] -right-[9.5rem] md:-top-24 md:-right-[25rem]",
    gradient: ["#4a664f", "#0c2a1f"],
    alt: "Our moment 6",
    size: "lg",
  },
  {
    id: 7,
    rotation: 5,
    position: "top-[37%] -right-[10rem] md:-right-[17rem]",
    gradient: ["#b89e68", "#4a664f"],
    alt: "Our moment 7",
    size: "md",
  },
  {
    id: 8,
    rotation: -12,
    position: "-bottom-14 -right-[7.5rem] md:-bottom-[10.5rem] md:-right-[7.5rem]",
    gradient: ["#a36e6a", "#c48a7f"],
    alt: "Our moment 8",
    size: "lg",
  },
  {
    id: 9,
    rotation: -6,
    position: "top-[92%] -right-[12.5rem] md:-right-[22.5rem]",
    gradient: ["#4a664f", "#b89e68"],
    alt: "Our moment 9",
    size: "sm",
  },
];

export const MOBILE_CAROUSEL_TOP = PHOTO_PLACEMENTS.filter((p) => p.id % 2 === 1);
export const MOBILE_CAROUSEL_BOTTOM = PHOTO_PLACEMENTS.filter((p) => p.id % 2 === 0);