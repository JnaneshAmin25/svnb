"use client";

import Image from "next/image";
import { FaSearchPlus } from "react-icons/fa";
import type { GalleryMedia } from "@/data/galleryVideos";

type Props = {
  image: GalleryMedia;
  onSelect: () => void;
  /** Grid span classes injected by the parent (e.g. "col-span-2 row-span-1"). */
  className?: string;
};

export default function ImageCard({ image, onSelect, className = "" }: Props) {
  const label = image.title || image.caption || "Gallery image";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open image: ${label}`}
      className={`group relative isolate block h-full w-full overflow-hidden bg-zinc-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src={image.thumb ?? image.poster}
        alt={image.caption ?? image.title}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/65 to-transparent p-4">
        <span className="line-clamp-2 text-sm font-semibold leading-5 text-white drop-shadow sm:text-base">
          {label}
        </span>
      </div>

      <span
        aria-hidden
        className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center bg-black/60 text-white shadow ring-1 ring-white/30 transition group-hover:bg-black/80"
      >
        <FaSearchPlus className="h-4 w-4" />
      </span>
    </button>
  );
}
