"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FaStar, FaTimes } from "react-icons/fa";
import FormLegalLinks from "@/components/legal/FormLegalLinks";
import {
  FormSubmitButton,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_FORM_LABEL_CLASS,
} from "@/components/forms/PublicFormControls";

type ReviewModalProps = {
  onClose: () => void;
};

export default function ReviewModal({ onClose }: ReviewModalProps) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, message: message.trim() }),
      });
      const result = await response.json();

      if (response.status === 401) {
        onClose();
        router.push("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          result?.error?.detail || result?.message || "Unable to submit your review.",
        );
      }

      setFeedback("Thank you. Your review was submitted for approval.");
      setMessage("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your review.",
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-dialog-title"
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e63946]">
              Customer review
            </p>
            <h2 id="review-dialog-title" className="mt-2 font-title text-2xl font-bold text-zinc-900">
              Share your experience
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="grid h-10 w-10 shrink-0 place-items-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submitReview} className="mt-6 space-y-5">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-800">
              Your rating
            </legend>
            <div className="flex gap-2" aria-label={`${rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={rating === value}
                    className="p-1 text-2xl text-amber-400 transition-colors hover:text-amber-500"
                  >
                    <FaStar className={value <= rating ? "fill-current" : "text-zinc-300"} />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={PUBLIC_FORM_LABEL_CLASS}>
              Your review
            </span>
            <textarea
              required
              minLength={5}
              maxLength={2000}
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us about your experience..."
              className={PUBLIC_FORM_INPUT_CLASS}
            />
          </label>

          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          {feedback ? <p className="text-sm text-green-700">{feedback}</p> : null}

          <FormSubmitButton
            disabled={loading || Boolean(feedback)}
            loading={loading}
            loadingText="Submitting…"
          >
            {feedback ? "Review submitted" : "Submit review"}
          </FormSubmitButton>
        </form>

        <FormLegalLinks className="mt-5 border-t border-zinc-200 pt-5" />
      </div>
    </div>,
    document.body,
  );
}
