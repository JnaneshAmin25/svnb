import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { invalidateCache } from "@/lib/cache";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { uploadToCloudinary } from "@/lib/cloudinary/uploader";
import { GALLERY_CATEGORIES, type GalleryCategoryDbKey } from "@/data/galleryCategories";

const galleryCategoryValues = GALLERY_CATEGORIES
  .filter((item) => item.value)
  .map((item) => item.value) as [GalleryCategoryDbKey, ...GalleryCategoryDbKey[]];

const createSchema = z.object({
  title: z.string().optional(),
  kind: z.enum(["IMAGE", "VIDEO"]),
  category: z.enum(galleryCategoryValues),
  orientation: z.string().default("landscape"),
  mediaType: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const rows = await db.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ok({ items: rows }));
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const form = await request.formData();
    const payload = createSchema.parse({
      title: form.get("title"),
      kind: form.get("kind"),
      category: form.get("category"),
      orientation: form.get("orientation"),
      mediaType: form.get("mediaType"),
    });
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "file missing"), { status: 400 });
    }
    const expectedType = payload.kind === "VIDEO" ? "video/" : "image/";
    if (!file.type.startsWith(expectedType)) {
      return NextResponse.json(fail("INVALID_FILE_TYPE", `Select a valid ${payload.kind.toLowerCase()} file.`), { status: 400 });
    }
    const maxBytes = payload.kind === "VIDEO" ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size <= 0 || file.size > maxBytes) {
      return NextResponse.json(fail("FILE_TOO_LARGE", `${payload.kind === "VIDEO" ? "Videos" : "Images"} must be smaller than ${maxBytes / 1024 / 1024} MB.`), { status: 413 });
    }

    const buffer = await file.arrayBuffer();
    const uploaded = await uploadToCloudinary(file.name, buffer, file.type);
    const row = await db.galleryItem.create({
      data: {
        kind: payload.kind,
        category: payload.category,
        title: payload.title ?? null,
        src: uploaded.secure_url,
        poster: uploaded.poster_url,
        orientation: payload.orientation,
        mediaType: payload.mediaType ?? null,
        cloudinaryPublicId: uploaded.public_id,
        createdByAdminId: admin.user.id,
        isPublished: true,
      },
    });

    await invalidateCache("gallery:");
    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "GALLERY_CREATED",
      entity: "gallery",
      entityId: row.id,
      payload: { kind: payload.kind },
    });

    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(fail("DATABASE_ERROR", "Unable to save the gallery item."), { status: 500 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid gallery payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to create gallery item"), { status: 500 });
  }
}
