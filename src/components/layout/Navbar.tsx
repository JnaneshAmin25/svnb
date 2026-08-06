"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import logoOnDark from "../../../public/Images/Logo/logo-light.png";
import logoOnLight from "../../../public/Images/Logo/logo-dark.png";
import { site } from "@/data/site";

const NAVBAR_HEIGHT_CLASS = "h-20";
const DRAWER_TOP_CLASS = "top-30";

type NavbarProps = {
  useLightChrome: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

export default function Navbar({
  useLightChrome,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
}: NavbarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`relative transition-colors duration-300 ${
        useLightChrome ? "bg-white text-zinc-900 shadow-sm" : "bg-transparent text-white"
      }`}
    >
      <Container>
        <div className={`flex ${NAVBAR_HEIGHT_CLASS} items-center justify-between`}>
          <Link href="/" className="flex items-center" aria-label={site.name}>
            <Image
              src={useLightChrome ? logoOnLight : logoOnDark}
              alt={site.name}
              priority
              className="h-10 w-auto sm:h-13"
            />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {site.navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`font-title py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    useLightChrome
                      ? "text-zinc-700 hover:text-[#e63946]"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
            className={`md:hidden ${useLightChrome ? "text-zinc-900" : "text-white"}`}
          >
            {isMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-7 w-7">
                <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-7 w-7">
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      <div
        aria-hidden={!isMenuOpen}
        onClick={onCloseMenu}
        className={`fixed inset-0 top-30 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="mobile-drawer"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        className={`fixed ${DRAWER_TOP_CLASS} right-0 bottom-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white text-zinc-900 shadow-xl transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto px-6 py-4">
          <ul className="flex flex-col gap-1">
            {site.navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onCloseMenu}
                  className="font-title block rounded px-2 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-[#e63946]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-zinc-200 px-6 py-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Legal
          </h2>
          <ul className="flex flex-col gap-1">
            {site.legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={onCloseMenu}
                  className="block rounded px-2 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-[#e63946]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </nav>
  );
}
