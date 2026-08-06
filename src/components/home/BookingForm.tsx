import Image from "next/image";

const LABEL_CLASS =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-900";
const INPUT_CLASS =
  "w-full border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-500 outline-none transition focus:ring-1 focus:ring-zinc-800/30";

export default function BookingForm() {
  return (
    <div className="bg-white p-5 shadow-xl sm:p-6 md:p-7">
      <h6 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#e63946]">
        Book Now
      </h6>
      <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
        Reserve the Band
      </h2>

      <hr className="my-2 border-zinc-200" />

      <form className="space-y-2.5">
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
          className="w-full bg-[#e63946] py-2 text-md font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]"
        >
          Book the Band
        </button>
      </form>

      <div className="my-3 flex items-center gap-3 text-sm font-md tracking-widest text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <a
        href="https://wa.me/918123834047"
        className="inline-flex w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-4 py-1 text-sm font-medium text-zinc-900 transition-colors hover:border-[#25d366] hover:text-[#128c7e]"
        aria-label="Chat with us on WhatsApp"
      >
        <Image
          src="/Images/Social/Whatapp.png"
          alt=""
          width={24}
          height={24}
          className="h-8 w-8 object-contain"
        />
        <span>Chat with us</span>
      </a>
    </div>
  );
}
