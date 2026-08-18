"use client";

import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "/Images/Hero/hero-section.png", alt: "Band performing at a temple festival" },
  { src: "/Images/Festival/Ganesh_Chaturthi.jpg", alt: "Ganesh Chaturthi celebration" },
  { src: "/Images/Hero/hero-section.png", alt: "Band performing at a temple festival" },
  { src: "/Images/Festival/Ganesh_Chaturthi.jpg", alt: "Ganesh Chaturthi celebration" },
  { src: "/Images/Hero/hero-section.png", alt: "Band performing at a temple festival" },
  { src: "/Images/Festival/Ganesh_Chaturthi.jpg", alt: "Ganesh Chaturthi celebration" },
];

/** Three copies of the same list so the keyframe loop never shows a seam. */
const TRACK = [...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES];

export default function Gallery() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="relative w-full">
        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center pointer-events-none">
          <a
            href="https://www.instagram.com/_svnb_udp_/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex flex-col items-center"
          >
            <span className="text-[#e63946] font-semibold text-sm md:text-lg bg-white px-6 py-2 rounded-full">
              @_svnb_udp_
            </span>
          </a>
        </div>

        {/* Marquee track — animates translateX -33.333% (one full copy) on a loop. */}
        <div className="flex w-max animate-gallery-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
          {TRACK.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="relative aspect-square w-[30vw] shrink-0 sm:w-[15vw] md:w-[15vw] min-[1441px]:w-[12vw]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1441px) 12vw, (min-width: 768px) 15vw, (min-width: 640px) 15vw, 30vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
