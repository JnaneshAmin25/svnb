import type { Metadata } from "next";
import PageHero from "@/components/shared/PageHero";
import { site } from "@/data/site";
import { FAQ_ITEMS } from "@/data/faq";
import ContactInquiryForm from "@/components/contact/ContactInquiryForm";
import QuickContactCards from "@/components/contact/QuickContactCards";
import ContactSocialProof from "@/components/contact/ContactSocialProof";
import ContactMiniFaq from "@/components/contact/ContactMiniFaq";
import ContactTrustSection from "@/components/contact/ContactTrustSection";

export const metadata: Metadata = {
  title: "Contact & Booking — Shri Veera Vinayaka Nasik Band",
  description:
    "Contact Shri Veera Vinayaka Nasik Band for bookings in Udupi, Dakshina Kannada, and nearby districts. Get event quotes for weddings, festivals, and religious processions.",
};

const QUICK_CONTACT_POINTS = [
  {
    kind: "phone" as const,
    title: "Call / WhatsApp",
    value: site.phone,
    href: `tel:${site.phone.replace(/\\s+/g, "")}`,
    note: "Reply in 24 hours",
  },
  {
    kind: "email" as const,
    title: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    note: "For venue details and booking clarity",
  },
  {
    kind: "address" as const,
    title: "Base Location",
    value: site.footer.contact.address,
    href: "https://maps.google.com/?q=Indrali,Udupi",
    note: "Udupi area coverage",
  },
  {
    kind: "hours" as const,
    title: "Service Hours",
    value: "Mon–Sun, 9:00 AM - 9:00 PM",
    note: "Emergency event coordination available",
  },
];

const CONTACT_FAQS = [
  FAQ_ITEMS[0],
  FAQ_ITEMS[1],
  FAQ_ITEMS[2],
  FAQ_ITEMS[3],
];

const CONTACT_TESTIMONIALS = [
  {
    quote:
      "Booked them for our temple festival and everything was perfectly organised — from timing to music selection.",
    name: "Ramesh S.",
    role: "Temple Committee",
  },
  {
    quote:
      "Very professional team and beautiful presentation. Guests praised the coordination and rhythm throughout the event.",
    name: "Priya N.",
    role: "Wedding Host",
  },
  {
    quote:
      "They understood our requirements quickly and handled everything smoothly on the day. Great value and discipline.",
    name: "Mahesh K.",
    role: "Ganesh Chaturthi Volunteer",
  },
];

const WEBSITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function ContactPage() {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "PerformingGroup",
    name: site.name,
    url: WEBSITE_URL,
    image: `${WEBSITE_URL}/Images/Logo/logo.png`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Udupi",
      addressCountry: "IN",
      postalCode: "576101",
    },
    areaServed: ["Udupi", "Dakshina Kannada", "Mangalore", "nearby Karnataka districts"],
    sameAs: site.socials.map((social) => social.href),
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Nasik Band performance bookings",
      },
    },
  });

  return (
    <main>
      <PageHero
        title="Contact & Booking"
        subtitle="Tell us about your event details and get a quote for temple processions, weddings, and festivals across Udupi."
        image="/Images/Hero/hero-section.png"
        cta={{ href: "#book-the-band", label: "Book the Band" }}
      />

      <QuickContactCards items={QUICK_CONTACT_POINTS} />

      <section id="book-the-band" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="text-center font-title text-3xl uppercase tracking-wide text-zinc-900 md:text-4xl">
              Book Your Event
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-zinc-700">
              Share your date and event requirements, and our team will reach out
              with availability, package recommendations, and a transparent quote.
            </p>
            <ContactInquiryForm className="mt-10" />
          </div>
        </div>
      </section>

      <ContactSocialProof
        heading="What clients say"
        items={CONTACT_TESTIMONIALS}
      />

      <ContactMiniFaq
        heading="Frequently asked booking questions"
        items={CONTACT_FAQS}
      />

      <ContactTrustSection
        name={site.name}
        phone={site.phone}
        email={site.email}
        address={site.footer.contact.address}
      />

      <script
        id="contact-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schema }}
      />
    </main>
  );
}
