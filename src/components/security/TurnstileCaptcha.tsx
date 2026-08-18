"use client";

import { useEffect, useRef } from "react";
import { clientEnv } from "@/lib/firebase/client-env";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: {
        sitekey: string;
        callback: (token: string) => void;
        "expired-callback": () => void;
      }) => string;
      remove: (container: HTMLElement | string) => void;
      reset: (container: HTMLElement | string) => void;
    };
  }
}

type Props = {
  onTokenChange: (token: string | null) => void;
  className?: string;
};

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const CONTAINER_ID = "cf-turnstile-container";

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("cf-turnstile-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile script"));
      document.head.appendChild(script);
      return;
    }

    if (window.turnstile) {
      resolve();
      return;
    }

    const onLoad = () => resolve();
    existing.addEventListener("load", onLoad, { once: true });
  });
}

export default function TurnstileCaptcha({ onTokenChange, className }: Props) {
  const siteKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!siteKey) return;

    let mounted = true;
    let cancelled = false;

    const run = async () => {
      try {
        await loadTurnstileScript();
        if (!mounted || !containerRef.current || cancelled) return;

        if (renderedRef.current || !window.turnstile) return;
        const container = containerRef.current;
        const callback = (token: string) => onTokenChange(token);

        const widget = window.turnstile.render(container, {
          sitekey: siteKey,
          callback,
          "expired-callback": () => onTokenChange(null),
        });
        renderedRef.current = true;
        if (!widget) {
          onTokenChange(null);
          return;
        }
      } catch {
        onTokenChange(null);
      }
    };

    void run();

    return () => {
      mounted = false;
      cancelled = true;
      if (!renderedRef.current || !containerRef.current || !window.turnstile) return;
      window.turnstile.remove(containerRef.current);
      renderedRef.current = false;
    };
  }, [onTokenChange, siteKey]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-900">
        Security Check
      </label>
      <div ref={containerRef} id={CONTAINER_ID} />
    </div>
  );
}
