"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TopBar from "./TopBar";

const SCROLL_THRESHOLD_PX = 50;

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const useLightChrome = isScrolled || isMenuOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-600">
      <TopBar isDark={useLightChrome} />
      <Navbar
        useLightChrome={useLightChrome}
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen((v) => !v)}
        onCloseMenu={() => setIsMenuOpen(false)}
      />
    </header>
  );
}