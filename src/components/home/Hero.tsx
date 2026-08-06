import Image from "next/image";
import Button from "@/components/ui/Button";

const HEADER_HEIGHT_CLASS = "min-h-[calc(100vh-120px)]";
const CLIENTS = [
  {
    id: 2,
    image: "/Images/Hero/Avatar/Avatar2.jpg",
    name: "Client 2",
  },
  {
    id: 3,
    image: "/Images/Hero/Avatar/Avatar3.jpg",
    name: "Client 3",
  },
  {
    id: 4,
    image: "/Images/Hero/Avatar/Avatar4.jpg",
    name: "Client 4",
  },
];

type HeroProps = {
  zIndex?: string;
};

export default function Hero({ zIndex }: HeroProps) {
  return (
    <section className={`relative min-h-screen w-full overflow-hidden bg-zinc-900 ${zIndex}`}>
      <Image
        src="/Images/Hero/hero-section.png"
        alt=""
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className={`relative z-10 flex ${HEADER_HEIGHT_CLASS} flex-col items-center justify-center px-6 pt-24 text-center`}>
        <h1 className="max-w-4xl text-3xl font-semibold uppercase tracking-tight text-white sm:text-5xl md:text-7xl lg:text-[80px] lg:leading-[1.05]">
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
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <div className="order-2 md:order-1 flex -space-x-3">
            {CLIENTS.map((client) => (
              <span
                key={client.id}
                className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-zinc-200 shadow-md"
              >
                <Image
                  src={client.image}
                  alt={client.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
            ))}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-xs font-bold text-white shadow-md">
              +7
            </span>
          </div>
          <div className="order-1 md:order-2 flex flex-col items-center sm:items-start">
            <Image
              src="/Images/Hero/five-stars.png"
              alt="5 star rating"
              width={230}
              height={80}
              className="h-7 w-auto object-contain"
            />
            <p className="text-xs font-medium text-white/85 sm:text-sm">
              by 20+ clients
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-30 -translate-y-1/2 text-white/80 transition-colors hover:text-white sm:left-4 md:left-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-30 -translate-y-1/2 text-white/80 transition-colors hover:text-white sm:right-4 md:right-6"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </section>
  );
}
