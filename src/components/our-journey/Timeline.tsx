import Image from "next/image";
import { JOURNEY_MILESTONES } from "@/data/ourJourney";

export type JourneyMilestone = {
  year: string;
  title: string;
  description: string;
  image: string;
};

export default function Timeline() {
  return (
    <section className="bg-zinc-100">
      <div className="mx-auto max-w-7xl py-14">
        <ol className="relative">
          {/* Center spine (desktop only) */}
          <span
            aria-hidden="true"
            className="hidden sm:block absolute left-1/2 top-10 bottom-0 w-70 -translate-x-1/2 bg-center"
            style={{ backgroundImage: "url('/Images/Roadmap/roadmap.png')" }}
          />

          {JOURNEY_MILESTONES.map((milestone, index) => {
            const isEven = index % 2 === 1;
            return (
              <li key={milestone.year} className="relative mb-12 sm:mb-16">
                <div
                  className={`flex flex-col sm:flex-row sm:items-center sm:gap-70 ${
                    isEven
                      ? "items-end sm:flex-row"
                      : "items-start sm:flex-row-reverse"
                  }`}
                >
                  {/* Image column — alternating flush edge on mobile */}
                  <div
                    className={`w-[85%] sm:w-1/2 ${
                      isEven ? "pl-4 sm:pl-0" : "pr-4 sm:pr-0"
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                      <Image
                        src={milestone.image!}
                        alt={milestone.title}
                        fill
                        sizes="(min-width: 640px) 40vw, 80vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Content column */}
                  <div
                    className={`mt-5 w-full px-6 sm:mt-0 sm:w-1/2 sm:px-0 ${
                      isEven ? "text-left" : "text-left"
                    }`}
                  >
                    
                    <h3 className="mt-2 font-title text-xl font-semibold uppercase text-zinc-900 sm:text-2xl">
                      {milestone.title} 
                      <span className=" ms-2 font-title text-2xl font-semibold uppercase text-[#e63946] sm:text-3xl">{milestone.year}</span>
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-700 sm:text-base">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
