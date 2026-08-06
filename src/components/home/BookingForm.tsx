import { FaWhatsapp } from "react-icons/fa";

const LABEL_CLASS =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#e63946]";
const INPUT_CLASS =
  "w-full rounded border border-[#e63946] bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-[#e63946] outline-none transition focus:ring-2 focus:ring-[#e63946]/40";

export default function BookingForm() {
  return (
    <div className="bg-white p-5 shadow-xl sm:p-6 md:p-7">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
        Book Now
      </p>
      <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
        Reserve the Band
      </h2>

      <a
        href="https://wa.me/918123834047"
        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#e63946] hover:text-[#c1121f]"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="text-xl" />
        <span>Chat with us</span>
      </a>

      <hr className="my-4 border-zinc-200" />

      <form className="space-y-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="event-type" className={LABEL_CLASS}>
              Event Type
            </label>
            <select id="event-type" className={`${INPUT_CLASS} appearance-none`}>
              <option>Select Event Type</option>
              <option>Wedding</option>
              <option>Festival</option>
              <option>Temple Event</option>
            </select>
          </div>
          <div>
            <label htmlFor="event-date" className={LABEL_CLASS}>
              Date
            </label>
            <input id="event-date" type="date" className={INPUT_CLASS} />
          </div>
        </div>

        <div>
          <label htmlFor="event-location" className={LABEL_CLASS}>
            Location
          </label>
          <input
            id="event-location"
            type="text"
            placeholder="Enter Location"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="event-details" className={LABEL_CLASS}>
            Additional (Optional)
          </label>
          <textarea
            id="event-details"
            rows={3}
            placeholder="Tell us about your event..."
            className={INPUT_CLASS}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#e63946] py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]"
        >
          Book the Band
        </button>
      </form>
    </div>
  );
}
