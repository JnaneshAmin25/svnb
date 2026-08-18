import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { decryptText } from "@/lib/security/crypto";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { sendTransactionalEmail } from "@/lib/email/send";
import { invalidateCache } from "@/lib/cache";

const replySchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminReply: z.string().optional(),
  userEmail: z.string().email().optional(),
});
const filterSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const parsedStatus = status ? filterSchema.safeParse(status) : null;
  if (status && !parsedStatus?.success) {
    return NextResponse.json(fail("INVALID_FILTER", "Invalid review status"), { status: 400 });
  }

  const rows = await db.review.findMany({
    where: parsedStatus ? { status: parsedStatus.data } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json(ok({
    items: rows.map((row) => ({
      id: row.id,
      status: row.status,
      rating: row.rating,
      message: decryptText(row.messageCipher) ?? "",
      adminReply: row.adminReply,
      user: {
        name: row.user.fullNameCipher ? decryptText(row.user.fullNameCipher) : null,
        email: row.user.emailCipher ? decryptText(row.user.emailCipher) : null,
        phone: row.user.phoneCipher ? decryptText(row.user.phoneCipher) : null,
      },
      createdAt: row.createdAt.toISOString(),
    })),
  }));
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const body = await request.json();
    const payload = replySchema.parse(body);
    const { id, status, adminReply, userEmail } = payload;

    const row = await db.review.update({
      where: { id },
      data: {
        status,
        adminReply,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    const targetEmail = (userEmail || (row.user.emailCipher ? decryptText(row.user.emailCipher) : null)) ?? null;

    if (targetEmail) {
      const baseLines = ["Hi,", `Your review status is ${status}.`];
      const reasonLines = adminReply ? [`Reply: ${adminReply}`] : [];
      try {
        if (status === "APPROVED") {
          await sendTransactionalEmail(targetEmail, "Your review is approved on Sri Veera Vinayaka", [
            ...baseLines,
            "Your review is approved and now visible on the website.",
            ...reasonLines,
          ]);
        } else {
          await sendTransactionalEmail(targetEmail, "Review status update", [
            ...baseLines,
            "Your review was not approved.",
            ...reasonLines,
          ]);
        }
      } catch {
        // email failures are non-blocking for moderation updates
      }
    }

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: status === "APPROVED" ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
      entity: "review",
      entityId: row.id,
      payload: { status },
    });
    await invalidateCache("reviews:approved:v1");

    return NextResponse.json(ok({ id: row.id, status: row.status }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Review not found"), { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update review"), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json(fail("INVALID_PAYLOAD", "Review id is required"), { status: 400 });
    await db.review.delete({ where: { id } });
    await invalidateCache("reviews:approved:v1");
    await emitAdminEvent({ actorId: admin.user.id, eventType: "REVIEW_REJECTED", entity: "review", entityId: id, payload: { deleted: true } });
    return NextResponse.json(ok({ id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json(fail("NOT_FOUND", "Review not found"), { status: 404 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to delete review"), { status: 500 });
  }
}
