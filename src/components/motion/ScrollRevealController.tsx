"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "main > section:not([data-page-hero]):not([data-scroll-reveal-skip])",
  "main > div:not([data-page-hero]):not([data-scroll-reveal-skip])",
  "main > article:not([data-page-hero]):not([data-scroll-reveal-skip])",
].join(",");

export default function ScrollRevealController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const registered = new WeakSet<HTMLElement>();
    const pendingFrames = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.dataset.scrollReveal = "visible";
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const registerSections = () => {
      const sections = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

      for (const section of sections) {
        if (registered.has(section)) continue;
        registered.add(section);

        if (prefersReducedMotion) {
          section.dataset.scrollReveal = "visible";
          continue;
        }

        section.dataset.scrollReveal = "hidden";
        const frame = window.requestAnimationFrame(() => {
          pendingFrames.delete(frame);
          if (section.isConnected) observer.observe(section);
        });
        pendingFrames.add(frame);
      }
    };

    registerSections();

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const removedNode of record.removedNodes) {
          if (!(removedNode instanceof HTMLElement)) continue;
          if (removedNode.matches(REVEAL_SELECTOR)) observer.unobserve(removedNode);
          for (const section of removedNode.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
            observer.unobserve(section);
          }
        }
      }
      registerSections();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      for (const frame of pendingFrames) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
