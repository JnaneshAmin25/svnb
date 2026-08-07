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

        {/* Marquee track — animates translateX -33.333% (one full copy) on a loop. */}
        <div className="flex w-max animate-gallery-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
          {TRACK.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="relative aspect-square w-[45vw] shrink-0 sm:w-[22vw] md:w-[22vw] min-[1441px]:w-[18vw]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1441px) 18vw, (min-width: 768px) 22vw, (min-width: 640px) 22vw, 45vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
