import Link from "next/link";
import { FaClock, FaEnvelope, FaMapMarkerAlt, FaPhone, FaWhatsapp } from "react-icons/fa";
import type { ComponentType } from "react";

type ContactInfoKind = "phone" | "email" | "address" | "hours" | "whatsapp";

type ContactCard = {
  kind: ContactInfoKind;
  title: string;
  value: string;
  note?: string;
  href?: string;
};

const ICONS = {
  phone: FaPhone,
  email: FaEnvelope,
  address: FaMapMarkerAlt,
  hours: FaClock,
  whatsapp: FaWhatsapp,
} satisfies Record<ContactInfoKind, ComponentType<{ className?: string }>>;

export default function QuickContactCards({ items }: { items: readonly ContactCard[] }) {
  return (
    <section className="bg-zinc-100 py-12 md:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.kind];
          const content = (
            <article className="h-full bg-white p-5 ring-1 ring-zinc-200">
              <div className="flex h-full flex-col gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e63946]/10 text-[#e63946]">
                  <Icon className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {item.title}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-zinc-900">
                    {item.value}
                  </p>
                  {item.note && (
                    <p className="mt-2 text-sm text-zinc-500">{item.note}</p>
                  )}
                </div>
              </div>
            </article>
          );

          return (
            item.href ? (
              <Link
                key={item.title}
                href={item.href}
                className="group transition duration-200 hover:-translate-y-0.5"
                target={item.kind === "address" ? "_blank" : undefined}
                rel={item.kind === "address" ? "noreferrer" : undefined}
              >
                {content}
              </Link>
            ) : (
              <div key={item.title} className="transition duration-200">
                {content}
              </div>
            )
          );
        })}
      </div>
    </section>
  );
}
