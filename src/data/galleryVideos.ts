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
    "Lead Drummer",
    "Band captain leading the procession",
    "/Images/Hero/av1.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-2",
    "Tasha Solo",
    "Tasha player mid-strike",
    "/Images/Hero/cardIcon.PNG",
    "portrait",
  ),
  IMG(
    "img-portrait-3",
    "Uniform Detail",
    "Embroidered sash and cap",
    "/Images/Hero/Card_Icon.PNG",
    "portrait",
  ),
  IMG(
    "img-portrait-4",
    "Founders Portrait",
    "The five founding drummers, 2017",
    "/Images/our-journey/our-journey-1.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-5",
    "Junior Drummer",
    "Next-generation member at practice",
    "/Images/our-journey/our-journey-2.jpg",
    "portrait",
  ),
  IMG(
    "img-portrait-6",
    "Palki Bearer",
    "Carrying the deity through the streets",
    "/Images/our-journey/our-journey-3.jpg",
    "portrait",
  ),

  /* ── Landscape images ── */
  IMG(
    "img-landscape-1",
    "Ganesh Chaturthi",
    "Main procession, 2024",
    "/Images/Festival/Ganesh_Chaturthi.jpg",
    "landscape",
  ),
  IMG(
    "img-landscape-2",
    "Festival Stage",
    "Band lined up at the temple square",
    "/Images/Hero/hero-section.png",
    "landscape",
  ),
  IMG(
    "img-landscape-3",
    "Wedding Procession",
    "Beating through the wedding mandap",
    "/Images/Roadmap/roadmap.png",
    "landscape",
  ),
  IMG(
    "img-landscape-4",
    "Temple Front",
    "Awaiting the deity at dawn",
    "/Images/Hero/roadmap.png",
    "landscape",
  ),

  /* ── Portrait videos ── */
  VID(
    "vid-portrait-1",
    "Tasha Solo",
    "Vertical cut — solo performance",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "/Images/Hero/av1.jpg",
    "portrait",
  ),
  VID(
    "vid-portrait-2",
    "Dhol Practice",
    "Rehearsal clip, filmed on phone",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "/Images/Hero/cardIcon.PNG",
    "portrait",
  ),

  /* ── Landscape videos ── */
  VID(
    "vid-landscape-1",
    "Bharatanatyam",
    "Full ensemble performance",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "/Images/Festival/Ganesh_Chaturthi.jpg",
    "landscape",
  ),
  VID(
    "vid-landscape-2",
    "Ganesh Chaturthi",
    "Immersion procession highlight",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "/Images/Hero/hero-section.png",
    "landscape",
  ),
  VID(
    "vid-landscape-3",
    "Wedding Procession",
    "Beating the wedding route",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "/Images/Hero/hero-section.png",
    "landscape",
  ),
  VID(
    "vid-landscape-4",
    "Temple Festival",
    "Stage performance at the annual temple festival",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "/Images/Festival/Ganesh_Chaturthi.jpg",
    "landscape",
  ),
] as const;
