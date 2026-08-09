"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AboutVideo
 * A scroll-driven video section.
 *
 * Behaviour:
 *   - Video starts at ~50% viewport width when the top of the video
 *     reaches the bottom 80% of the viewport.
 *   - Grows to 100% viewport width as the top of the video reaches the
 *     top 20% of the viewport.
 *   - Inverse on scroll-up (width shrinks back at the same thresholds).
 *
 * Implementation note: the video frame is `sticky` inside a tall track so
 * the rAF loop has enough scroll distance to interpolate the width
 * smoothly from 50% → 100%.
 */
export default function AboutVideo() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0 = narrow, 1 = full width

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Anchor: the track's TOP edge (== the video's top while the
      // sticky frame is pinned, since the sticky offset is inside the
      // track and we never scroll past the pin point during the
      // animation).
      //
      //  - trackTop at 80% of viewport → progress = 0 (narrow, 50% width)
      //  - trackTop at 20% of viewport → progress = 1 (full, 100% width)
      const trackTop = rect.top;
      const p = (vh * 0.8 - trackTop) / (vh * 0.6);
      setProgress(Math.max(0, Math.min(1, p)));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update(); // initial paint, e.g. on resize / hydration
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const widthPct = 50 + progress * 50;

  return (
    <section className="bg-zinc-100 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4">

        {/*
          Tall track + sticky inner frame gives the scroll-driven width
          change enough scroll distance to play out smoothly. The sticky
          offset (15vh) sits inside the trigger band (20%–80%), so the
          animation finishes before the video ever pins.
        */}
        <div
          ref={sectionRef}
          className="relative mx-auto"
          style={{ height: "160vh" }}
        >
          <div
            className="sticky top-[15vh] overflow-hidden bg-zinc-900 shadow-lg"
            style={{
              width: `${widthPct}%`,
              margin: "0 auto",
              aspectRatio: "16 / 9",
            }}
          >
            <video
              className="h-full w-full object-cover"
              src="/Videos/about-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
}