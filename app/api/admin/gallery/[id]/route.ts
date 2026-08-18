import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { invalidateCache } from "@/lib/cache";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { deleteFromCloudinary } from "@/lib/cloudinary/uploader";
import { GALLERY_CATEGORIES, type GalleryCategoryDbKey } from "@/data/galleryCategories";

const galleryCategoryValues = GALLERY_CATEGORIES
  .filter((item) => item.value)
  .map((item) => item.value) as [GalleryCategoryDbKey, ...GalleryCategoryDbKey[]];

const patchSchema = z
  .object({
  title: z.string().optional(),
  category: z.enum(galleryCategoryValues).optional(),
  isPublished: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const payload = patchSchema.parse(body);
    const row = await db.galleryItem.update({
      where: { id },
      data: payload,
    });

    await invalidateCache("gallery:");
    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "GALLERY_UPDATED",
      entity: "gallery",
      entityId: id,
    });
    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Gallery item not found"), { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update gallery item"), { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(_request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const { id } = await params;
    const row = await db.galleryItem.findUnique({ where: { id } });
    if (!row) return NextResponse.json(fail("NOT_FOUND", "Item not found"), { status: 404 });

    if (row.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(row.cloudinaryPublicId, row.kind as "IMAGE" | "VIDEO");
      } catch {
        return NextResponse.json(
          fail("MEDIA_DELETE_FAILED", "Cloud media could not be deleted. Try again."),
          { status: 502 },
        );
      }
    }

    await db.galleryItem.delete({ where: { id } });

    await invalidateCache("gallery:");
    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "GALLERY_DELETED",
      entity: "gallery",
      entityId: id,
    });
    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Item not found"), { status: 404 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to delete gallery item"), { status: 500 });
  }
}
