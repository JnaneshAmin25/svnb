"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import {
  GALLERY_MEDIA,
  type GalleryMedia,
} from "@/data/galleryVideos";

type SelectedItem = {
  kind: "image" | "video";
  items: GalleryMedia[];
  index: number;
};

const SECTIONS = [
  { key: "images", label: "Photos", kind: "image" as const },
  { key: "videos", label: "Videos", kind: "video" as const },
];

export default function GalleryGrid() {
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const buckets = useMemo(() => {
    const out: Record<string, GalleryMedia[]> = {};
    for (const section of SECTIONS) {
      out[section.key] = GALLERY_MEDIA.filter((m) => m.type === section.kind);
    }
    return out;
  }, []);

  const goTo = (offset: number) => {
    setSelected((prev) => {
      if (!prev) return prev;
      const len = prev.items.length;
      const index = (prev.index + offset + len) % len;
      return { ...prev, index };
    });
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <Container>
        <h2 className="sr-only">Gallery</h2>

        <div className="flex flex-col gap-14 sm:gap-20">
          {SECTIONS.map((section) => {
            const items = buckets[section.key];
            if (items.length === 0) return null;

            return (
              <section key={section.key} aria-labelledby={`${section.key}-title`}>
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-zinc-200 pb-3">
                  <h3
                    id={`${section.key}-title`}
                    className="font-title text-xl font-semibold uppercase tracking-wide text-zinc-900 sm:text-2xl"
                  >
                    {section.label}
                    <span className="ms-2 text-sm font-medium text-zinc-500">
                      ({items.length})
                    </span>
                  </h3>
                  <span className="hidden text-xs uppercase tracking-wider text-zinc-500 sm:inline">
                    Mixed orientations
                  </span>
                </div>

                <BentoRow
                  items={items}
                  onSelect={(item) =>
                    setSelected({
                      kind: section.kind,
                      items,
                      index: items.findIndex((i) => i.id === item.id),
                    })
                  }
                />
              </section>
            );
          })}
        </div>

        {selected?.kind === "image" && (
          <ImageModal
            image={selected.items[selected.index]}
            onClose={() => setSelected(null)}
            onPrev={selected.items.length > 1 ? () => goTo(-1) : undefined}
            onNext={selected.items.length > 1 ? () => goTo(1) : undefined}
          />
        )}
        {selected?.kind === "video" && (
          <VideoModal
            video={selected.items[selected.index]}
            onClose={() => setSelected(null)}
            onPrev={selected.items.length > 1 ? () => goTo(-1) : undefined}
            onNext={selected.items.length > 1 ? () => goTo(1) : undefined}
          />
        )}
      </Container>
    </section>
  );
}

/* ─────────────────────  BENTO LAYOUT  ─────────────────────
 *
 * A CSS grid with a fixed row height. Each item spans 1 or 2 rows/
 * columns depending on orientation. `grid-flow-row-dense` is the key
 * fix: without it, the browser only ever moves *forward* through the
 * grid, so a tall portrait item leaves a hole next to it that the next
 * small item can't back-fill. With dense packing, the grid fills every
 * hole it can, which is what actually produces a bento look instead of
 * a staircase of gaps.
 *
 * The row height (not aspect-ratio) now owns the sizing — cards fill
 * their track with `fill` images, so nothing fights the grid for space.
 */
function BentoRow({
  items,
  onSelect,
}: {
  items: GalleryMedia[];
  onSelect: (item: GalleryMedia) => void;
}) {
  return (
    <div
      className="grid grid-flow-row-dense grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 auto-rows-[150px] sm:auto-rows-[170px] lg:auto-rows-[190px]"
    >
      {items.map((item) => {
        const span =
          item.orientation === "landscape"
            ? "col-span-2 row-span-1"
            : item.orientation === "square"
              ? "col-span-1 row-span-1"
              : "col-span-1 row-span-2";

        return item.type === "video" ? (
          <VideoCard
            key={item.id}
            video={item}
            onSelect={() => onSelect(item)}
            className={span}
          />
        ) : (
          <ImageCard
            key={item.id}
            image={item}
            onSelect={() => onSelect(item)}
            className={span}
          />
        );
      })}
    </div>
  );
}