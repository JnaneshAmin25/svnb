"use client";

import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import type { GalleryMedia } from "@/data/galleryVideos";

type Props = {
  video: GalleryMedia;
  onSelect: () => void;
  /** Grid span classes injected by the parent (e.g. "col-span-2 row-span-1"). */
  className?: string;
};

export default function VideoCard({ video, onSelect, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Play video: ${video.title}`}
      className={`group relative isolate block h-full w-full overflow-hidden bg-zinc-900 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 ${className}`}
    >
      <Image
        src={video.thumb ?? video.poster}
        alt={video.caption ?? video.title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-90 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
        <span className="text-lg font-semibold text-white drop-shadow sm:text-xl">
          {video.title}
        </span>
      </div>

      <span
        aria-hidden
        className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center bg-black/60 text-white shadow ring-1 ring-white/30 transition group-hover:bg-black/80"
      >
        <FaPlay className="h-4 w-4 translate-x-[1px]" />
      </span>
    </button>
  );
}