type ContactTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export default function ContactSocialProof({
  heading = "What clients say",
  items,
}: {
  heading?: string;
  items: readonly ContactTestimonial[];
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <h2 className="text-center font-title text-3xl font-bold text-zinc-900 md:text-4xl">
          {heading}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={`${item.name}-${item.role}`}
              className="bg-zinc-100 p-6 ring-1 ring-zinc-200 transition-shadow hover:shadow-lg"
            >
              <blockquote className="text-sm leading-7 text-zinc-700">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500">{item.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
