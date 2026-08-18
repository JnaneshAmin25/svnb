import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getCachedJSON, setCachedJSON } from "@/lib/cache";
import { ok } from "@/lib/security/response";

export async function GET() {
  const cacheKey = "gallery:public:v1";
  const cached = await getCachedJSON<{
    items: {
      id: string;
      type: string;
      kind: string;
      title?: string | null;
      category: string;
      src: string;
      poster: string;
      orientation: string;
    }[];
  }>(cacheKey);
  if (cached) return NextResponse.json(ok(cached));

  const rows = await db.galleryItem.findMany({
    where: { isDeleted: false, isPublished: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const payload = {
    items: rows.map((row) => ({
      id: row.id,
      type: row.kind.toLowerCase(),
      kind: row.kind.toLowerCase(),
      title: row.title,
      category: row.category.toLowerCase(),
      src: row.kind === "VIDEO" ? row.src : row.poster,
      poster: row.poster,
      orientation: row.orientation,
    })),
  };

  await setCachedJSON(cacheKey, payload, 120);
  return NextResponse.json(ok(payload));
}
