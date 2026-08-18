import Image from "next/image";
import Button from "@/components/ui/Button";

const HEADER_HEIGHT_CLASS = "min-h-[calc(100vh-120px)]";

type HeroProps = {
  zIndex?: string;
};

export default function Hero({ zIndex }: HeroProps) {
  return (
    <section
      data-page-hero
      className={`relative min-h-screen w-full overflow-hidden bg-zinc-900 ${zIndex}`}
    >
      <Image
        src="/Images/Hero/hero-section.png"
        alt=""
        fill
        preload
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className={`relative z-10 flex ${HEADER_HEIGHT_CLASS} flex-col items-center justify-center px-6 pt-24 text-center`}>
        <h1 className="max-w-4xl text-4xl font-semibold uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[80px] lg:leading-[1.05]">
          God Is Within Us
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85 sm:mt-6 sm:text-base md:text-lg">
          Step into a sacred space where devotion meets community. Discover
          daily rituals, sermons, and events that bring the divine closer to
          every heart.
        </p>
        <div className="mt-10">
          <Button href="/events">Explore Events</Button>
        </div>
        <div className="mt-3 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:gap-4">
          <div className="flex items-center sm:items-start">
            <Image
              src="/Images/Hero/five-stars.png"
              alt="5 star rating"
              width={230}
              height={80}
              className="h-7 w-auto object-contain"
            />
            <p className=" ms-2 mt-0.5 text-xs text-white/85 sm:text-sm">
              by 20+ clients
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
