"use client";

import { FormEvent, useState } from "react";
import TurnstileCaptcha from "@/components/security/TurnstileCaptcha";
import FormLegalLinks from "@/components/legal/FormLegalLinks";
import WhatsAppChatAction from "@/components/contact/WhatsAppChatAction";
import {
  FormSubmitButton,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_FORM_LABEL_CLASS,
} from "@/components/forms/PublicFormControls";

type ContactInquiryPayload = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  specialRequest: string;
  captchaToken?: string;
};

type ContactInquiryFormProps = {
  className?: string;
  onSubmit?: (payload: ContactInquiryPayload) => void;
};

export default function ContactInquiryForm({ className = "", onSubmit }: ContactInquiryFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const isCaptchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      eventType: String(formData.get("eventType") || ""),
      eventDate: String(formData.get("eventDate") || ""),
      location: String(formData.get("location") || ""),
      specialRequest: String(formData.get("specialRequest") || ""),
      ...(captchaToken ? { captchaToken } : {}),
    };

    if (onSubmit) {
      onSubmit(payload);
      return;
    }

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Failed to submit");
        setMessage("Thank you! We will get back to you shortly.");
        event.currentTarget.reset();
        setCaptchaToken(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto w-full max-w-3xl bg-white p-5 shadow-xl sm:p-6 md:p-7 ${className}`}
    >
      <h6 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
        Booking enquiry
      </h6>
      <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Get a Custom Quote</h2>

      <hr className="my-2 border-zinc-200" />

      <div className="mt-2.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={PUBLIC_FORM_LABEL_CLASS}>
            Full Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            className={PUBLIC_FORM_INPUT_CLASS}
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className={PUBLIC_FORM_LABEL_CLASS}>
            Phone Number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            className={PUBLIC_FORM_INPUT_CLASS}
            placeholder="+91 00000 00000"
          />
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className={PUBLIC_FORM_LABEL_CLASS}>
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            className={PUBLIC_FORM_INPUT_CLASS}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="contact-event-type" className={PUBLIC_FORM_LABEL_CLASS}>
            Event Type
          </label>
          <select
            id="contact-event-type"
            name="eventType"
            required
            className={`${PUBLIC_FORM_INPUT_CLASS} appearance-none`}
          >
            <option value="">Select Event Type</option>
            <option>Wedding</option>
            <option>Temple Event</option>
            <option>Festival</option>
            <option>Family Function</option>
          </select>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-date" className={PUBLIC_FORM_LABEL_CLASS}>
            Event Date
          </label>
          <input
            id="contact-date"
            name="eventDate"
            type="date"
            required
            className={PUBLIC_FORM_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="contact-location" className={PUBLIC_FORM_LABEL_CLASS}>
            Event Location
          </label>
          <input
            id="contact-location"
            name="location"
            type="text"
            required
            placeholder="Venue / location"
            className={PUBLIC_FORM_INPUT_CLASS}
          />
        </div>
      </div>

      <div className="mt-2.5">
        <label htmlFor="contact-request" className={PUBLIC_FORM_LABEL_CLASS}>
          Special Request
        </label>
        <textarea
          id="contact-request"
          name="specialRequest"
          rows={4}
          placeholder="Tell us timings, route, processional preference, and any special instruction."
          className={PUBLIC_FORM_INPUT_CLASS}
        />
      </div>

      <FormSubmitButton
        disabled={isCaptchaEnabled && !captchaToken}
        className="mt-2"
      >
        Send Booking Request
      </FormSubmitButton>
      <TurnstileCaptcha onTokenChange={setCaptchaToken} className="mt-3" />
      {isCaptchaEnabled && !captchaToken ? (
        <p className="mt-1 text-xs text-zinc-500">Please complete the security check before sending your request.</p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-green-700">{message}</p> : null}

      <div className="my-3 flex items-center gap-3 text-sm font-medium tracking-widest text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <WhatsAppChatAction />
      <FormLegalLinks className="mt-4" />
    </form>
  );
}
