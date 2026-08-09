"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaExpand, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { GalleryMedia } from "@/data/galleryVideos";

type Props = {
  video: GalleryMedia | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const TRANSITION_MS = 180;

export default function VideoModal({ video, onClose, onPrev, onNext }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!video) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [video]);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, TRANSITION_MS);
  };

  useEffect(() => {
    if (!video) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], video, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, onPrev, onNext]);

  if (!video || !video.src) return null;

  const toggleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${video.title}`}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity duration-[180ms] sm:p-8 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl bg-black shadow-2xl transition-all duration-[180ms] ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between gap-2 bg-black/90 px-4 py-3 text-white">
          <div className="min-w-0">
            <span className="block truncate font-semibold">{video.title}</span>
            {video.caption && (
              <span className="block truncate text-xs text-white/70">
                {video.caption}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="grid h-9 w-9 place-items-center text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FaExpand aria-hidden />
            </button>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={handleClose}
              aria-label="Close video"
              className="grid h-9 w-9 place-items-center text-white/90 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FaTimes aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative">
          <video
            key={video.id}
            ref={videoRef}
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            muted
            playsInline
            className="block aspect-video w-full bg-black"
          />

          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous video"
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-black/60 text-white ring-1 ring-white/30 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
            >
              <FaChevronLeft aria-hidden />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next video"
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