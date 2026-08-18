"use client";

import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import { GALLERY_CATEGORIES, toGalleryCategoryKey, type GalleryFilterKey, type GalleryCategoryKey } from "@/data/galleryCategories";
import {
  GALLERY_MEDIA,
  type GalleryMedia,
} from "@/data/galleryVideos";
import { useEffect } from "react";

type SelectedItem = {
  items: GalleryMedia[];
  index: number;
};

type GalleryApiItem = Omit<GalleryMedia, "category" | "poster" | "orientation"> & {
  category?: string | null;
  orientation?: GalleryMedia["orientation"] | null;
  poster?: string | null;
};

export default function GalleryGrid() {
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [media, setMedia] = useState<GalleryMedia[]>(() =>
    GALLERY_MEDIA.map((item) => ({
      ...item,
      category: item.category || "moments",
    })),
  );
  const [activeCategory, setActiveCategory] = useState<GalleryFilterKey>("all");

  const defaultCategory: GalleryCategoryKey = "moments";

  useEffect(() => {
    let mounted = true;
    fetch("/api/gallery")
      .then((response) => response.json())
      .then((payload: unknown) => {
        const items =
          (payload as { data?: { items?: GalleryApiItem[] } })?.data?.items ?? [];
        if (!mounted || !Array.isArray(items)) return;

        const normalized = items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title || "",
          caption: item.caption,
          orientation: item.orientation || "landscape",
          category: toGalleryCategoryKey(
            typeof item.category === "string" ? item.category : defaultCategory,
          ),
          src: item.src,
          poster: item.poster || item.src,
          thumb: item.thumb || item.poster || item.src,
        }));
        setMedia(normalized as GalleryMedia[]);
      })
      .catch(() => {
        setMedia(
          GALLERY_MEDIA.map((item) => ({
            ...item,
            category: item.category || "moments",
          })),
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const buckets = useMemo(() => {
    if (activeCategory === "all") return media;
    return media.filter((item) => item.category === activeCategory);
  }, [media, activeCategory]);

  const hasItems = buckets.length > 0;
  const selectedItem = selected?.items[selected.index] ?? null;
  const selectedCount = selected?.items.length ?? 0;

  const goTo = (offset: number) => {
    setSelected((prev) => {
      if (!prev) return prev;
      const len = prev.items.length;
      const index = (prev.index + offset + len) % len;
      return { ...prev, index };
    });
  };

  return (
    <section id="gallery-media" className="bg-white py-14 sm:py-20">
      <Container>
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e63946]">
            Media gallery
          </p>
          <h2 className="mt-3 font-title text-3xl font-bold uppercase text-zinc-900 sm:text-4xl">
            Celebrations in frame
          </h2>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10">
          {GALLERY_CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                activeCategory === category.key
                  ? "border-[#e63946] bg-[#e63946] text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {hasItems ? (
          <MediaGrid
            items={buckets}
            onSelect={(item) =>
              setSelected({
                items: buckets,
                index: buckets.findIndex((candidate) => candidate.id === item.id),
              })
            }
          />
        ) : (
          <p className="py-16 text-center text-sm text-zinc-500">
            No items in this category yet.
          </p>
        )}

        {selectedItem?.type === "image" && (
          <ImageModal
            image={selectedItem}
            onClose={() => setSelected(null)}
            onPrev={selectedCount > 1 ? () => goTo(-1) : undefined}
            onNext={selectedCount > 1 ? () => goTo(1) : undefined}
          />
        )}
        {selectedItem?.type === "video" && (
          <VideoModal
            video={selectedItem}
            onClose={() => setSelected(null)}
            onPrev={selectedCount > 1 ? () => goTo(-1) : undefined}
            onNext={selectedCount > 1 ? () => goTo(1) : undefined}
          />
        )}
      </Container>
    </section>
  );
}

function MediaGrid({
  items,
  onSelect,
}: {
  items: GalleryMedia[];
  onSelect: (item: GalleryMedia) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {items.map((item) =>
        item.type === "video" ? (
          <VideoCard
            key={item.id}
            video={item}
            onSelect={() => onSelect(item)}
            className="aspect-[4/3]"
          />
        ) : (
          <ImageCard
            key={item.id}
            image={item}
            onSelect={() => onSelect(item)}
            className="aspect-[4/3]"
          />
        ),
      )}
    </div>
  );
}
