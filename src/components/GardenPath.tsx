interface ScheduleItem {
  readonly time: string;
  readonly description: string;
}

interface GardenPathProps {
  schedule: readonly ScheduleItem[];
}

export default function GardenPath({ schedule }: GardenPathProps) {
  return (
    <div className="mx-auto max-w-2xl text-left">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sage/70">The garden path</p>
      <ol className="relative space-y-8 border-l border-sage/30 pl-8">
        {schedule.map((item) => (
          <li key={`${item.time}-${item.description}`} className="relative">
            <span
              className="absolute -left-[2.28rem] top-1.5 size-3 rounded-full bg-accent-secondary ring-4 ring-cream"
              aria-hidden
            />
            <time className="text-sm font-medium tracking-wide text-accent-primary">{item.time}</time>
            <p className="mt-1 text-foreground/75">{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
