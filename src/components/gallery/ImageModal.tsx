"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { GalleryMedia } from "@/data/galleryVideos";

type Props = {
  image: GalleryMedia | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const TRANSITION_MS = 180;

export default function ImageModal({ image, onClose, onPrev, onNext }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  // Enter/exit transition: fade+scale in on open, fade+scale out before
  // the parent actually unmounts us (closing is deferred by TRANSITION_MS).
  useEffect(() => {
    if (!image) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [image]);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, TRANSITION_MS);
  };

  useEffect(() => {
    if (!image) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [image]);

  useEffect(() => {
    if (!image) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, onPrev, onNext]);

  if (!image) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${image.title}`}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm transition-opacity duration-[180ms] sm:p-8 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl bg-black shadow-2xl transition-all duration-[180ms] ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between gap-3 bg-black/90 px-4 py-3 text-white">
          <div className="min-w-0">
            <span className="block truncate font-semibold">{image.title}</span>
            {image.caption && (
              <span className="block truncate text-xs text-white/70">
                {image.caption}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close image"
            className="grid h-9 w-9 shrink-0 place-items-center text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <FaTimes aria-hidden />
          </button>
        </div>

        {/* Image */}
        <div className="relative flex max-h-[80vh] w-full items-center justify-center bg-black">
          <Image
            key={image.id}
            src={image.poster}
            alt={image.caption ?? image.title}
            width={1600}
            height={1200}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
            priority
          />

          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-black/60 text-white ring-1 ring-white/30 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
            >
              <FaChevronLeft aria-hidden />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-black/60 text-white ring-1 ring-white/30 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
            >
              <FaChevronRight aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}