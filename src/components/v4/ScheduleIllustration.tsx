interface ScheduleIllustrationProps {
  kind: "feastPhotography" | "reception";
}

export default function ScheduleIllustration({
  kind,
}: ScheduleIllustrationProps) {
  if (kind === "feastPhotography") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 96 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[60px] w-20 md:h-[72px] md:w-24"
      >
        <path d="M8 50h43" />
        <path d="M12 46.5h35" />
        <path d="M15.5 43.5c.7-10.1 6.8-17.2 14-17.2s13.3 7.1 14 17.2" />
        <path d="M26.7 25.9v-1.7a2.8 2.8 0 0 1 5.6 0v1.7" />
        <path d="M60 31.5h22.5a5.5 5.5 0 0 1 5.5 5.5v15.5a5.5 5.5 0 0 1-5.5 5.5H60a5.5 5.5 0 0 1-5.5-5.5V37a5.5 5.5 0 0 1 5.5-5.5Z" />
        <path d="m62.5 31.5 3.2-5h10.8l3.2 5" />
        <circle cx="71.3" cy="44.7" r="8" />
        <circle cx="71.3" cy="44.7" r="4.2" />
        <circle cx="82.2" cy="36.8" r="1" fill="currentColor" stroke="none" />
        <path d="m49 22 1.8 1.8L49 25.6l-1.8-1.8L49 22Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[60px] w-20 md:h-[72px] md:w-24"
    >
      <g transform="rotate(-8 37 37)">
        <path d="M27 17h20l-2.2 20.5a8 8 0 0 1-15.6 0L27 17Z" />
        <path d="M30 29h14" />
        <path d="M37 45v13" />
        <path d="M30.5 58h13" />
      </g>
      <g transform="rotate(8 59 37)">
        <path d="M49 17h20l-2.2 20.5a8 8 0 0 1-15.6 0L49 17Z" />
        <path d="M52 29h14" />
        <path d="M59 45v13" />
        <path d="M52.5 58h13" />
      </g>
      <path d="M75 12v8M71 16h8" />
      <path d="m82 24 1.7 1.7L82 27.4l-1.7-1.7L82 24Z" />
    </svg>
  );
}
