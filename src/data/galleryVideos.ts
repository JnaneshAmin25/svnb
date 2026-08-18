import { type GalleryCategoryKey } from "@/data/galleryCategories";

/**
 * One unified model for the gallery. Each item is either a still image or a video,
 * and each carries an explicit `orientation` so the grid can lay it out without
 * having to introspect media dimensions at build time.
 */
export type GalleryMediaType = "image" | "video";

/** "portrait" → taller than wide; "landscape" → wider than tall; "square" → equal. */
export type GalleryOrientation = "portrait" | "landscape" | "square";

export type GalleryMedia = {
  id: string;
  type: GalleryMediaType;
  title: string;
  category?: GalleryCategoryKey;
  /** Caption shown on the card. Optional short description (e.g. "Ganesh Chaturthi 2024"). */
  caption?: string;
  orientation: GalleryOrientation;
  /** Required for videos — mp4 url loaded by the browser. */
  src?: string;
  /** Required for images — full-size image url. Also used as the video poster. */
  poster: string;
  /** Smaller image used on the card. Falls back to `poster` when omitted. */
  thumb?: string;
};

/* ─────────────────────────────  IMAGES  ───────────────────────────── */

const IMG = (
  id: string,
  title: string,
  caption: string,
  poster: string,
  orientation: GalleryOrientation,
): GalleryMedia => ({
  id,
  type: "image",
  title,
  caption,
  category: "moments",
  orientation,
  poster,
});

/* ─────────────────────────────  VIDEOS  ───────────────────────────── */

const VID = (
  id: string,
  title: string,
  caption: string,
  src: string,
  poster: string,
  orientation: GalleryOrientation,
): GalleryMedia => ({
  id,
  type: "video",
  title,
  caption,
  category: "moments",
  orientation,
  src,
  poster,
});

/**
 * Order matters here only within each orientation bucket — the grid sorts by
 * type (images first) and orientation (portrait first) at render time.
 */
export const GALLERY_MEDIA: readonly GalleryMedia[] = [
  /* ── Portrait images ── */
  IMG(
    "img-portrait-1",
    "",
    "Band captain leading the procession",
    "/Images/Gallery/Images/1.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-2",
    "",
    "Tasha player mid-strike",
    "/Images/Gallery/Images/2.jpeg",
    "portrait",
  ),
  IMG(
    "img-portrait-3",
    "",
    "Embroidered sash and cap",
    "/Images/Gallery/Images/4.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-4",
    "",
    "The five founding drummers, 2017",
    "/Images/Gallery/Images/5.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-5",
    "",
    "Next-generation member at practice",
    "/Images/Gallery/Images/6.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-6",
    "",
    "Carrying the deity through the streets",
    "/Images/Gallery/Images/9.jpeg",
    "portrait",
  ),

  /* ── Landscape images ── */
  IMG(
    "img-landscape-1",
    "",
    "Main procession, 2024",
    "/Images/Gallery/Images/3.jpeg",
    "landscape",
  ),
  IMG(
    "img-landscape-2",
    "",
    "Band lined up at the temple square",
    "/Images/Gallery/Images/7.jpg",
    "landscape",
  ),
  IMG(
    "img-landscape-3",
    "",
    "Beating through the wedding mandap",
    "/Images/Gallery/Images/8.jpeg",
    "landscape",
  ),

  /* ── Portrait videos ── */
  VID(
    "vid-portrait-1",
    "",
    "Vertical cut — solo performance",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "/Images/Hero/av1.jpg",
    "portrait",
  ),
  VID(
    "vid-portrait-2",
    "",
    "Rehearsal clip, filmed on phone",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "/Images/Hero/cardIcon.PNG",
    "portrait",
  ),

  /* ── Landscape videos ── */
  VID(
    "vid-landscape-1",
    "",
    "Full ensemble performance",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "/Images/Festival/Ganesh_Chaturthi.jpg",
    "landscape",
  ),
  VID(
    "vid-landscape-2",
    "",
    "Immersion procession highlight",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "/Images/Hero/hero-section.png",
    "landscape",
  ),
  VID(
    "vid-landscape-3",
    "",
    "Beating the wedding route",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "/Images/Hero/hero-section.png",
    "landscape",
  ),
  VID(
    "vid-landscape-4",
    "",
    "Stage performance at the annual temple festival",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "/Images/Festival/Ganesh_Chaturthi.jpg",
    "landscape",
  ),
] as const;
