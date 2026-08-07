"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";
import Button from "../ui/Button";

const RATING = "5.0";
const REVIEW_COUNT = "11 reviews";

const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "I recently watched Shree Veeravinayaka Nasik Band, and it was an **amazing experience!** The costumes were vibrant and stunning, adding to the overall excitement. The performers were well-dressed and looked fantastic. Their performances were **perfectly synced**, showcasing their talent. It`s clear that they are all well-trained and dedicated to their craft. **Highly recommend!**",
    name: "Sushanth Kumar",
    role: "Client",
  },
  {
    id: "2",
    quote:
      "Shree Veeravinayaka Nasik Band is excellent! Their performances are **well-synced** and fun to watch. The performers are well-dressed and wear amazing costumes that add to the show. They are good and trained, making every moment special. Plus, the **prices are reasonable.** I highly recommend them for any event!",
    name: "Tejas Devadiga",
    role: "Client",
  },
  {
    id: "3",
    quote:
      "Team SVNB is giving **awesome performance** during festivals. Jathra, Functions. They are also playing traditional tones ,**well disciplined** nasik troop ever seen in Udupi",
    name: "Abhishek",
    role: "Client",
  },
  {
    id: "4",
    quote: "Very good And Full high performance",
    name: "Mr rahul",
    role: "Client",
  },
  {
    id: "5",
    quote: "Very energetic Boys playing wonderful tune with bands",
    name: "Unknown",
    role: "Client",
  },
];

/** Cards per row by viewport: 1 on mobile, 2 on tab/laptop, 3 above 1440px. */
const CARDS_PER_VIEW: { minWidth: number; count: number }[] = [
  { minWidth: 1441, count: 3 },
  { minWidth: 640, count: 2 },  // sm
  { minWidth: 0, count: 1 },
];

function getCardsPerView(width: number): number {
  return CARDS_PER_VIEW.find((b) => width >= b.minWidth)?.count ?? 1;
}

export default function ClientReview() {
  const [page, setPage] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(TESTIMONIALS.length / 3),
  );

  useEffect(() => {
    const update = () => {
      const next = getCardsPerView(window.innerWidth);
      setCardsPerView((prev) => {
        const total = Math.ceil(TESTIMONIALS.length / next);
        // Clamp page so we don't land past the end after a breakpoint change.
        setPage((p) => (p >= total ? 0 : p));
        setTotalPages(total);
        return next;
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goPrev = useCallback(
    () => setPage((p) => (p - 1 + totalPages) % totalPages),
    [totalPages],
  );
  const goNext = useCallback(
    () => setPage((p) => (p + 1) % totalPages),
    [totalPages],
  );

  // Start index of the cards visible on this page.
  const startIndex = page * cardsPerView;
  const visible = TESTIMONIALS.slice(
    startIndex,
    startIndex + cardsPerView,
  );

  return (
    <section className="bg-zinc-100 py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h4 className="text-center font-title text-2xl font-bold text-zinc-900 md:text-3xl">
          What our clients say
        </h4>

        <div className="mt-10 flex flex-col md:flex-row md:items-stretch">
          {/* Stats panel — left column on desktop, top block on mobile */}
          <div className="flex flex-col items-center text-center md:w-64 md:items-start md:border-r md:border-zinc-200 md:pr-8 md:text-left">
            <p className="text-5xl font-medium text-zinc-900">{RATING}</p>
            <div className="flex items-center md:flex-col md:items-start">
              <Image
                src="/Images/Hero/five-stars.png"
                alt="5 star rating"
                width={120}
                height={20}
                className="mt-2 h-8 w-auto"
              />
              <span className="md:hidden text-zinc-500 mt-2 ms-2 md:mt-0">/</span>
              <p className="mt-2 md:mt-0 ms-2 text-sm text-zinc-500">{REVIEW_COUNT}</p>
            </div>
            <div className="md:mt-16">
              <p className="hidden md:block text-sm text-zinc-500">are you our customer?</p>
              <Button href="#" className="mt-2">
                Write Review
              </Button>
            </div>
          </div>

          {/* Testimonial carousel — responsive cards per view */}
          <div className="relative mt-12 md:mt-0 md:flex-1">
            <div className="overflow-hidden">
              <div className="flex flex-col divide-y divide-zinc-200 sm:flex-row sm:divide-x sm:divide-y-0 min-[1441px]:flex-row min-[1441px]:divide-x min-[1441px]:divide-y-0">
                {visible.map((t) => (
                  <div key={t.id} className="sm:flex-1 min-[1441px]:flex-1">
                    <TestimonialCard
                      company={t.id}
                      quote={t.quote}
                      name={t.name}
                      role={t.role}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination controls — dots centered with chevrons on either side */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonials"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-200 transition hover:bg-zinc-50 sm:h-10 sm:w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 text-zinc-700"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Go to testimonials page ${i + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  i === page ? "bg-zinc-900" : "bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonials"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-200 transition hover:bg-zinc-50 sm:h-10 sm:w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 text-zinc-700"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
