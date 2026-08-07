"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
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
      "Shree Veeravinayaka Nasik Band is excellent! Their performances are well-synced and fun to watch. The performers are well-dressed and wear amazing costumes that add to the show. They are good and trained, making every moment special. Plus, the prices are reasonable. I highly recommend them for any event!",
    name: "Tejas Devadiga",
    role: "Client",
  },
  {
    id: "3",
    quote:
      "Team SVNB is giving awesome performance during festivals. Jathra, Functions. They are also playing traditional tones ,well disciplined nasik troop ever seen in Udupi",
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

/** Pages of 3 testimonials. 5 → [0..2], [3..4] (last page padded). */
const CARDS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(TESTIMONIALS.length / CARDS_PER_PAGE);

export default function ClientReview() {
  const [page, setPage] = useState(0);

  const goPrev = useCallback(
    () => setPage((p) => (p - 1 + TOTAL_PAGES) % TOTAL_PAGES),
    [],
  );
  const goNext = useCallback(
    () => setPage((p) => (p + 1) % TOTAL_PAGES),
    [],
  );

  // Start index of the 3 cards visible on this page.
  const startIndex = page * CARDS_PER_PAGE;
  const visible = TESTIMONIALS.slice(startIndex, startIndex + CARDS_PER_PAGE);

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
            <Image
              src="/Images/Hero/five-stars.png"
              alt="5 star rating"
              width={120}
              height={20}
              className="mt-2 h-8 w-auto"
            />
            <p className="ms-2 text-sm text-zinc-500">{REVIEW_COUNT}</p>

            <div className="mt-16">
              <p className="text-sm text-zinc-500">are you our customer?</p>
              <Button href="#" className="mt-2">
                Write Review
              </Button>
            </div>
          </div>

          {/* Testimonial carousel — 3 cards per view, scrollable left/right */}
          <div className="relative mt-12 md:mt-0 md:flex-1">
            {/* Prev / Next chevrons */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous testimonials"
              className="absolute -left-8 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-200 transition hover:bg-zinc-50 md:flex"
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
            <button
              type="button"
              onClick={goNext}
              aria-label="Next testimonials"
              className="absolute -right-8 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow ring-1 ring-zinc-200 transition hover:bg-zinc-50 md:flex"
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

            {/* Carousel viewport — exactly 3 cards per view on desktop */}
            <div className="md:overflow-hidden">
              <div className="flex flex-col divide-y divide-zinc-200 md:flex-row md:divide-x md:divide-y-0">
                {visible.map((t) => (
                  <div key={t.id} className="md:flex-1">
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

        {/* Pagination dots */}
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
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
      </div>
    </section>
  );
}
