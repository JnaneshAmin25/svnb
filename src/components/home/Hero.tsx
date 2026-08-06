import Image from "next/image";
import Button from "@/components/ui/Button";

const HEADER_HEIGHT_CLASS = "min-h-[calc(100vh-120px)]";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-zinc-900 z-100
    ">
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className={`relative z-10 flex ${HEADER_HEIGHT_CLASS} flex-col items-center justify-center px-6 pb-20 text-center`}>
        <h1 className="max-w-4xl text-4xl font-semibold uppercase tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[80px] lg:leading-[1.05]">
          God Is Within Us
        </h1>
        <p className="mt-6 max-w-2xl text-sm text-white/85 sm:text-base md:text-lg">
          Step into a sacred space where devotion meets community. Discover
          daily rituals, sermons, and events that bring the divine closer to
          every heart.
        </p>
        <div className="mt-10">
          <Button href="/events">Explore Events</Button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 text-white/80 transition-colors hover:text-white sm:left-4 md:left-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 text-white/80 transition-colors hover:text-white sm:right-4 md:right-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </section>
  );
}