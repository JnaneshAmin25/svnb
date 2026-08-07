"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

const EVENT_DATE = new Date("2026-09-14T00:00:00+05:30").getTime();
const UNITS = ["Days", "Hours", "Minutes", "Seconds"];

function getTimeLeft() {
  const difference = Math.max(EVENT_DATE - Date.now(), 0);

  return {
    Days: Math.floor(difference / 86400000),
    Hours: Math.floor((difference / 3600000) % 24),
    Minutes: Math.floor((difference / 60000) % 60),
    Seconds: Math.floor((difference / 1000) % 60),
  };
}

/** A single digit "slot" that only animates when its own value changes. */
function Digit({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setOutgoing(prevRef.current);
      setDisplay(value);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <span
      className="relative inline-block h-9 w-[1ch] overflow-hidden text-center align-top
                 text-3xl font-medium leading-9 tabular-nums text-white
                 sm:h-11 sm:w-[1ch] sm:leading-[2.75rem]"
    >
      {outgoing !== null && (
        <span
          key={`out-${outgoing}`}
          className="absolute inset-0 block animate-digit-out"
          onAnimationEnd={() => setOutgoing(null)}
        >
          {outgoing}
        </span>
      )}
      <span
        key={`in-${display}`}
        className={
          outgoing !== null
            ? "absolute inset-0 block animate-digit-in"
            : "absolute inset-0 block"
        }
      >
        {display}
      </span>
    </span>
  );
}

function DigitPair({ value }: { value: number }) {
  const chars = String(value).padStart(2, "0").split("");
  return (
    <span className="inline-flex justify-center">
      {chars.map((char, i) => (
        <Digit key={i} value={char} />
      ))}
    </span>
  );
}

export default function UpcomingEvent() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[420px] w-full overflow-hidden bg-zinc-950 py-20 text-white sm:min-h-[500px]">
      <Image
        src="/Images/Festival/Ganesh_chaturthi.jpg"
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-white/85">
          Upcoming Event
        </p>
        <h4 className="mt-4 text-xl font-bold uppercase text-white sm:text-4xl md:text-3xl">
          Ganesh Chaturthi
        </h4>
        <p className="mt-4 max-w-2xl text-xs leading-6 text-white/80 sm:text-sm">
          Celebrate Ganesh Chaturthi with powerful beats, devotion, and festive
          energy from Shri Veera Vinayaka Nasik Band.
        </p>

        <div className="mt-8 grid w-full max-w-2xl grid-cols-4">
          {UNITS.map((unit) => (
            <div key={unit} className="text-center">
              <DigitPair value={timeLeft[unit as keyof typeof timeLeft]} />
              <span className=" block text-[10px] font-medium uppercase tracking-widest text-white/75 sm:text-[15px]">
                {unit}
              </span>
            </div>
          ))}
        </div>

        <Button href="#book-now" className="mt-10">
          Book The Band
        </Button>
      </div>
    </section>
  );
}