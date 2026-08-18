"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/faq";

export default function ContactMiniFaq({
  heading = "Frequently asked questions",
  items,
}: {
  heading?: string;
  items: readonly FaqItem[];
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section className="bg-zinc-100 py-16 md:py-20">
      <div className="mx-auto w-full max-w-5xl px-6">
        <h2 className="text-center font-title text-3xl font-bold text-zinc-900 md:text-4xl">
          {heading}
        </h2>

        <div className="mt-10 border-t border-zinc-200">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="border-b border-zinc-200">
                <button
                  type="button"
                  id={`${item.id}-trigger`}
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-panel`}
                  onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                  className="flex w-full items-center justify-between gap-3 py-5 text-left transition-colors hover:text-[#e63946]"
                >
                  <span className="font-title text-base font-semibold uppercase tracking-wide text-zinc-900 sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition ${
                      isOpen
                        ? "rotate-45 border-[#e63946] bg-[#e63946] text-white"
                        : ""
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="h-4 w-4"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>

                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={`${item.id}-trigger`}
                  hidden={!isOpen}
                  className="pb-5 pr-12 text-sm leading-7 text-zinc-700 sm:text-base"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
