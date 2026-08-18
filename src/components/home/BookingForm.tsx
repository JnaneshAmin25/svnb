"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import FormLegalLinks from "@/components/legal/FormLegalLinks";
import WhatsAppChatAction from "@/components/contact/WhatsAppChatAction";
import {
  FormSubmitButton,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_FORM_LABEL_CLASS,
} from "@/components/forms/PublicFormControls";

type BookingPayload = {
  eventType: string;
  eventDate: string;
  location: string;
  specialRequest: string;
};

export default function BookingForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload: BookingPayload = {
      eventType: String(formData.get("eventType") || ""),
      eventDate: String(formData.get("eventDate") || ""),
      location: String(formData.get("location") || ""),
      specialRequest: String(formData.get("specialRequest") || ""),
    };

    if (!payload.eventType || !payload.eventDate || !payload.location) {
      setError("Please fill required fields.");
      return;
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result?.message || "Unable to create booking");
      if (response.status === 401) router.push("/login");
      return;
    }

    setMessage("Booking request submitted successfully.");
    event.currentTarget.reset();
  };

  return (
    <div className="bg-white p-5 shadow-xl sm:p-6 md:p-7">
      <h6 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
        Book Now
      </h6>
      <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
        Reserve the Band
      </h2>

      <hr className="my-2 border-zinc-200" />

      <form className="space-y-2.5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="eventType" className={PUBLIC_FORM_LABEL_CLASS}>
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              required
              className={`${PUBLIC_FORM_INPUT_CLASS} appearance-none`}
              defaultValue=""
            >
              <option value="" disabled>
                Select Event Type
              </option>
              <option>Wedding</option>
              <option>Festival</option>
              <option>Temple Event</option>
            </select>
          </div>
          <div>
            <label htmlFor="eventDate" className={PUBLIC_FORM_LABEL_CLASS}>
              Date
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              className={PUBLIC_FORM_INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className={PUBLIC_FORM_LABEL_CLASS}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            placeholder="Enter Location"
            className={PUBLIC_FORM_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="specialRequest" className={PUBLIC_FORM_LABEL_CLASS}>
            Additional (Optional)
          </label>
          <textarea
            id="specialRequest"
            name="specialRequest"
            rows={3}
            placeholder="Tell us about your event..."
            className={PUBLIC_FORM_INPUT_CLASS}
          />
        </div>

        <FormSubmitButton>Book the Band</FormSubmitButton>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}

      <div className="my-3 flex items-center gap-3 text-sm font-md tracking-widest text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <WhatsAppChatAction />
      <FormLegalLinks className="mt-4" />
    </div>
  );
}
