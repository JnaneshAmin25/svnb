import Image from "next/image";
import TestimonialCard from "./TestimonialCard";
import Button from "../ui/Button";

const RATING = "5.0";
const REVIEW_COUNT = "11 reviews";
const TOTAL_PAGES = 5;

const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "We like their work method, **design skills**, and the way they communicate.",
    name: "Vandyrichat Chhay",
    role: "Product Owner",
  },
  {
    id: "2",
    quote:
      "The most **impressive** thing about the company is their sensibility to **UI/UX**, which is very clean and user-friendly.",
    name: "Guillaume Nominé",
    role: "CEO",
  },
  {
    id: "3",
    quote:
      "The **communication** between the project team and Widiba **was top notch**.",
    name: "Andreas Karantzas",
    role: "Head of Software",
  },
];

export default function ClientReview() {
  return (
    <section className="bg-zinc-100 py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
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

            <div  className="mt-16">
              <p className="text-sm text-zinc-500">are you our customer?</p>
              <Button href="#" className="mt-2">
                Write Review
              </Button>
            </div>
          </div>

          {/* Testimonial cards — horizontal row on desktop, vertical stack on mobile */}
          <div className="mt-12 flex flex-col md:mt-0 md:flex-1 md:flex-row md:divide-x md:divide-zinc-200">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="border-t border-zinc-200 first:border-t-0 md:border-t-0"
              >
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

        {/* Pagination dots */}
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === 0 ? "bg-zinc-900" : "bg-zinc-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}