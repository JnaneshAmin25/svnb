"use client";

import Image from "next/image";
import Container from "@/components/ui/Container";
import SocialIconRow from "@/components/ui/SocialIconRow";
import FooterColumn from "@/components/ui/FooterColumn";
import { site } from "@/data/site";
import Gallery from "../home/Gallery";

type SocialLink = {
  name: string;
  href: string;
  icon: "facebook" | "youtube" | "instagram" | "twitter" | "linkedin";
};

export default function Footer() {
  const { phone, email, socials, footer } = site;
  const socialLinks = socials as SocialLink[];
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const mailtoHref = `mailto:${email}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white">
      <Gallery />

      {/* White columns */}
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:divide-x sm:divide-zinc-200 sm:gap-0">
          {/* Logo column — centered */}
          <div className="flex flex-col items-center text-center sm:pr-8">
            <a href="/" aria-label={`${site.name} home`}>
              <Image
                src="/Images/Logo/logo.png"
                alt={site.name}
                width={120}
                height={120}
                className="h-36 w-auto"
              />
            </a>
            <Image
              src="/Images/Logo/logo-dark.png"
              alt={site.name}
              width={160}
              height={40}
              className="-mt-4 h-12 w-auto"
            />
            <p className="-mt-1 text-sm text-zinc-500 font-medium">
              NASIK BAND
            </p>
          </div>

          {/* Contact Us */}
          <div className="sm:px-8">
            <h3 className="font-title text-lg font-semibold uppercase tracking-wide text-zinc-900">
              Contact Us
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-[#e63946]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C12.95 21.5 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                  </svg>
                </span>
                <span>{footer.contact.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-[#e63946]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v.4l8 5 8-5V6H4zm0 2.7V18h16V8.7l-8 5-8-5z" />
                  </svg>
                </span>
                <a href={mailtoHref} className="hover:text-[#e63946]">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-[#e63946]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.28.36-.68.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                  </svg>
                </span>
                <a href={telHref} className="hover:text-[#e63946]">
                  {phone}
                </a>
              </li>
            </ul>
          </div>

          <FooterColumn heading="Quick Links" links={footer.quickLinks} className="sm:px-8" />

          <FooterColumn
            heading="Useful Links"
            links={footer.usefulLinks}
            variant="uppercase"
            className="sm:pl-8"
          />
        </div>

        {/* Separator with scroll-to-top button, sitting on the line */}
        <div className="relative mt-10 h-5">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-300"
          />
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center  border-2 border-[#e63946] bg-white text-[#e63946] transition-colors hover:bg-[#e63946] hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* Copyright + social row — now a normal block, always below the separator */}
        <div className="flex flex-col items-center justify-between gap-3 pt-5 md:pt-3 md:flex-row">
          <p className="order-2 md:order-1 text-sm text-zinc-500">
            © {new Date().getFullYear()} {site.name}. All Rights Reserved.
          </p>
          <div className="order-1 md:order-2 text-zinc-700">
            <SocialIconRow
              items={socialLinks}
              hoverClassName="transition-colors hover:text-[#e63946]"
            />
          </div>
        </div>
      </Container>
    </footer>
  );
}