"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FAQ_ITEMS } from "@/data/faq";

/**
 * Single-row accordion. Lets the user open one question at a time; the active
 * item is reflected both visually and in the `aria-expanded` attribute so
 * screen readers get the right state.
 */
function FaqRow({
  id,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-zinc-200">
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-[#e63946]"
        >
          <span className="font-title text-base font-semibold uppercase tracking-wide text-zinc-900 sm:text-lg">
            {question}
          </span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-all duration-300 ${
              isOpen ? "rotate-45 border-[#e63946] bg-[#e63946] text-white" : ""
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
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!isOpen}
        className="pb-5 pr-12 text-sm leading-7 text-zinc-700 sm:text-base"
      >
        {answer}
      </div>
    </div>
  );
}

export default function Faq() {
  // Default to the first question open so the section has visible content on load.
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16">
          {/* Title block */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#e63946] sm:text-sm">
              Frequently Asked Questions
            </p>
            <h4 className="mt-3 font-title text-2xl font-bold uppercase text-zinc-900 md:text-3xl">
              Got Questions?
              <br />
              We Have Answers.
            </h4>
            <p className="mt-5 text-sm leading-7 text-zinc-700 sm:text-base">
              Everything you need to know about booking the band for your
              event — from processions to pricing. If your question isn&apos;t
              here, drop us a line and we will respond within 24 hours.
            </p>

            <div className="mt-8">
              <Button href="#book-now">Book The Band</Button>
            </div>
          </div>

          {/* Accordion */}
          <div className="border-t border-zinc-200">
            {FAQ_ITEMS.map((item) => (
              <FaqRow
                key={item.id}
                id={item.id}
                question={item.question}
                answer={item.answer}
                isOpen={openId === item.id}
                onToggle={() =>
                  setOpenId((prev) => (prev === item.id ? null : item.id))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}