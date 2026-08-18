import Link from "next/link";
import SocialIconRow from "@/components/ui/SocialIconRow";
import { site } from "@/data/site";

const TRUST_POINTS = [
  "Verified local performers and disciplined team",
  "Quick confirmation for event dates",
  "Area-wise booking with travel clarity",
  "Transparent pricing and package discussion",
];

export default function ContactTrustSection({
  name,
  phone,
  email,
  address,
}: {
  name: string;
  phone: string;
  email: string;
  address: string;
}) {
  return (
    <section className="border-t border-zinc-200 bg-white py-12 md:py-14">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 md:flex-row md:justify-between md:gap-12">
        <div className="md:max-w-[480px]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#e63946]">
            Trust & Contact
          </p>
          <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-zinc-900 sm:text-4xl">
            {name}
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-700">
            Bookings handled across Udupi and nearby areas with proper coordination,
            timely communication, and dedicated support for processions, weddings,
            and temple festivities.
          </p>

          <div className="mt-6 space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-semibold text-zinc-900">Address:</span> {address}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Phone:</span> {phone}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Email:</span> {email}
            </p>
          </div>

          <div className="mt-6">
            <SocialIconRow
              items={site.socials}
              iconClassName="h-5 w-5"
              listClassName="flex items-center gap-3"
              hoverClassName="text-[#e63946] transition-colors hover:text-[#c1121f]"
            />
          </div>
        </div>

        <ul className="grid flex-1 list-none gap-3 sm:grid-cols-2">
          {TRUST_POINTS.map((point) => (
            <li
              key={point}
              className="rounded-sm border border-zinc-200 bg-zinc-100 px-4 py-4 text-sm text-zinc-700"
            >
              {point}
            </li>
          ))}
        </ul>

        <div className="flex items-end">
          <Link
            href="/"
            className="inline-flex px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white bg-[#e63946] hover:bg-[#c1121f]"
          >
            Explore Our Services
          </Link>
        </div>
      </div>
    </section>
  );
}
