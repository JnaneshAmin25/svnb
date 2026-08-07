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
    )
  );
}

export default function TestimonialCard({
  company,
  quote,
  name,
  role,
}: TestimonialCardProps) {
  return (
    <article className="flex w-72 shrink-0 flex-col justify-between h-full px-3">
      <div>
        <blockquote className={`text-[15px] leading-7 ${REVIEW_BODY}`}>
          &ldquo;{renderQuote(quote)}&rdquo;
        </blockquote>
      </div>

      <div>
        <p className={`text-sm font-semibold ${REVIEW_NAME}`}>{name}</p>
        <p className={`mt-1 text-xs ${REVIEW_ROLE}`}>{role}</p>
      </div>
    </article>
  );
}