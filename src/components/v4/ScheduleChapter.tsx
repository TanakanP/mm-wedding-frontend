import GardenPath from "@/components/GardenPath";
import { WEDDING } from "@/content/wedding";

export default function ScheduleChapter() {
  return (
    <section
      id="schedule"
      aria-labelledby="schedule-title"
      className="garden-section garden-texture min-h-[72svh] bg-wine px-5 py-20 text-cream md:px-[7vw] md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-petal">
            The celebration
          </p>
          <h2
            id="schedule-title"
            className="mt-4 font-serif text-5xl italic leading-none text-cream md:text-7xl"
          >
            The day unfolds
          </h2>
        </header>

        <GardenPath schedule={WEDDING.schedule} />
      </div>
    </section>
  );
}
