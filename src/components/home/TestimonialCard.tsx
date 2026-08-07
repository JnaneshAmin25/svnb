"use client";

import { useState, useMemo } from "react";

type TestimonialCardProps = {
  company: string;
  /** Quote text. Words wrapped in **asterisks** render bold; the rest is muted. */
  quote: string;
  name: string;
  role: string;
};

const REVIEW_BODY = "text-zinc-500";
const REVIEW_NAME = "text-zinc-900";
const REVIEW_ROLE = "text-zinc-500";
const COLLAPSED_LETTER_LIMIT = 150;

/** Counts characters in the quote (excluding markdown asterisks). */
function countLetters(text: string): number {
  return text.replace(/\*/g, "").length;
}

/**
 * Returns the truncated text plus an ellipsis, capped at ~150 letters.
 * Avoids splitting inside a **bold** span or mid-word when possible.
 */
function truncateToLetters(text: string, limit: number): string {
  if (countLetters(text) <= limit) return text;

  // Walk through the original string (with asterisks) and stop once we've
  // emitted `limit` non-asterisk characters. Snap back to the previous
  // whitespace boundary so we don't break a word in half.
  let letters = 0;
  let cut = text.length;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "*") letters += 1;
    if (letters > limit) {
      cut = i;
      break;
    }
    if (letters === limit) {
      cut = i + 1;
    }
  }

  // Walk back to the previous whitespace to avoid splitting a word.
  for (let i = cut - 1; i > 0; i--) {
    if (/\s/.test(text[i])) {
      cut = i;
      break;
    }
  }

  let truncated = text.slice(0, cut).trimEnd();

  // If we landed inside a **bold** span, close it so the rendered output stays valid.
  const boldOpens = (truncated.match(/\*\*/g) || []).length;
  if (boldOpens % 2 === 1) truncated += "**";

  return truncated + "…";
}

/** Renders the quote string, splitting on **...** to bold those segments. */
function renderQuote(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={i} className={`font-semibold ${REVIEW_NAME}`}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function TestimonialCard({
  company,
  quote,
  name,
  role,
}: TestimonialCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLong = useMemo(
    () => countLetters(quote) > COLLAPSED_LETTER_LIMIT,
    [quote],
  );
  const displayQuote =
    expanded || !isLong ? quote : truncateToLetters(quote, COLLAPSED_LETTER_LIMIT);

  return (
    <article className="group flex h-full min-h-[16rem] shrink-0 flex-col justify-between bg-transparent px-4 py-4 transition-colors duration-200 bg-white md:bg-transparent hover:bg-white hover:shadow-lg md:px-5">
      <div>
        <blockquote className={`text-[15px] leading-7 ${REVIEW_BODY}`}>
          &ldquo;{renderQuote(displayQuote)}&rdquo;
        </blockquote>

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-2 text-sm font-medium text-zinc-500 hover:underline focus:outline-none focus-visible:underline"
          >
            {expanded ? "Read less" : "Read more.."}
          </button>
        )}
      </div>

      <div className="mt-8">
        <p className={`text-sm font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-[#e63946]`}>{name}</p>
        <p className={`mt-1 text-xs ${REVIEW_ROLE}`}>{role}</p>
      </div>
    </article>
  );
}
