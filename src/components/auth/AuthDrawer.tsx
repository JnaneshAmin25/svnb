"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const DRAWER_TRANSITION_MS = 520;

type AuthDrawerProps = {
  children: ReactNode;
  admin?: boolean;
  closeToHome?: boolean;
};

export default function AuthDrawer({
  children,
  admin = false,
  closeToHome = false,
}: AuthDrawerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isClosing = useRef(false);
  const closeTimer = useRef<number | null>(null);

  const navigateAway = useCallback(() => {
    if (closeToHome) {
      router.replace("/");
      return;
    }
    router.back();
  }, [closeToHome, router]);

  const close = useCallback(() => {
    if (isClosing.current) return;

    isClosing.current = true;
    setIsOpen(false);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    closeTimer.current = window.setTimeout(
      navigateAway,
      prefersReducedMotion ? 0 : DRAWER_TRANSITION_MS,
    );
  }, [navigateAway]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const openFrame = window.requestAnimationFrame(() => setIsOpen(true));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(openFrame);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label={admin ? "Admin sign in" : "Account access"}>
      <button
        type="button"
        aria-label="Close sign in"
        onClick={close}
        className={`absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px] transition-opacity duration-[400ms] ease-out motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        className={`absolute inset-y-0 right-0 flex w-full max-w-[500px] transform-gpu flex-col overflow-y-auto bg-white text-zinc-900 shadow-2xl transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 sm:px-9">
          <div className="flex items-center gap-3">
            <Image
              src="/Images/Logo/logo-dark.png"
              alt="Sri Veera Vinayaka"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
            {admin ? (
              <span className="rounded-sm border border-zinc-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
                Admin
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close sign in"
            className="grid h-10 w-10 place-items-center text-2xl font-light text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="flex flex-1 items-center px-6 py-10 sm:px-9 lg:px-12">
          <div className="w-full">{children}</div>
        </div>

        <p className="border-t border-zinc-200 px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:px-9">
          © {new Date().getFullYear()} Sri Veera Vinayaka Nasik Band
        </p>
      </section>
    </div>
  );
}
