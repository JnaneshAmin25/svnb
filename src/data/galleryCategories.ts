export const GALLERY_CATEGORY_DB = ["PARYAYA", "GANESHOTSAV", "WEDDING", "MOMENTS"] as const;

export type GalleryCategoryDbKey = (typeof GALLERY_CATEGORY_DB)[number];

export const GALLERY_CATEGORIES = [
  { key: "all", label: "All", value: null },
  { key: "paryaya", label: "paryaya", value: "PARYAYA" },
  { key: "ganeshotsav", label: "ganeshotsav", value: "GANESHOTSAV" },
  { key: "wedding", label: "Wedding", value: "WEDDING" },
  { key: "moments", label: "Moments", value: "MOMENTS" },
] as const;

type CategoryItem = (typeof GALLERY_CATEGORIES)[number];
export type GalleryFilterKey = CategoryItem["key"];
export type GalleryCategoryKey = Exclude<GalleryFilterKey, "all">;
export type GalleryCategoryApiKey = GalleryCategoryDbKey;

export const GALLERY_DB_CATEGORY_VALUES = GALLERY_CATEGORIES
  .filter((entry) => entry.value)
  .map((entry) => entry.value);

export function toGalleryCategoryKey(value: string | undefined | null): GalleryCategoryKey {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "PARYAYA") return "paryaya";
  if (normalized === "GANESHOTSAV") return "ganeshotsav";
  if (normalized === "WEDDING") return "wedding";
  return "moments";
}

export function toGalleryCategoryDb(value: string | undefined | null): GalleryCategoryDbKey {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "paryaya") return "PARYAYA";
  if (normalized === "ganeshotsav") return "GANESHOTSAV";
  if (normalized === "wedding") return "WEDDING";
  return "MOMENTS";
}
