import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { decryptText } from "@/lib/security/crypto";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { sendTransactionalEmail } from "@/lib/email/send";
import { z } from "zod";

const statusSchema = z.enum(["NEW", "CONTACTED", "CLOSED"]);
const replySchema = z.object({
  id: z.string(),
  status: statusSchema,
  adminReply: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const url = new URL(request.url);
  const rawStatus = url.searchParams.get("status");
  let where: { status?: "NEW" | "CONTACTED" | "CLOSED" } | undefined;
  if (rawStatus) {
    const parsedStatus = statusSchema.safeParse(rawStatus);
    if (!parsedStatus.success) {
      return NextResponse.json(fail("INVALID_FILTER", "Invalid contact status"), { status: 400 });
    }
    where = { status: parsedStatus.data };
  }

  const rows = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(ok({
    items: rows.map((row) => ({
      id: row.id,
      status: row.status,
      eventType: row.eventType,
      eventDate: row.eventDate.toISOString(),
      location: row.location,
      specialRequest: row.specialRequest ? decryptText(row.specialRequest) : null,
      name: row.nameCipher ? decryptText(row.nameCipher) : null,
      phone: row.phoneCipher ? decryptText(row.phoneCipher) : null,
      email: row.emailCipher ? decryptText(row.emailCipher) : null,
      createdAt: row.createdAt.toISOString(),
    })),
  }));
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const body = await request.json();
    const parsed = replySchema.parse(body);
    const row = await db.contactMessage.update({
      where: { id: parsed.id },
      data: {
        status: parsed.status,
        repliedAt: new Date(),
        repliedByAdminId: admin.user.id,
      },
    });

    const targetEmail = parsed.userEmail ?? (row.emailCipher ? decryptText(row.emailCipher) : null);
    if (targetEmail) {
      try {
        const lines = ["Hi,", "Your contact request status has been updated.", `Status: ${parsed.status}`];
        if (parsed.adminReply) {
          lines.push(`Message: ${parsed.adminReply}`);
        }
        await sendTransactionalEmail(targetEmail, "Your contact request update", lines);
      } catch {
        // Email is optional and should not block state update
      }
    }

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "CONTACT_UPDATED",
      entity: "contact",
      entityId: row.id,
      payload: { status: parsed.status },
    });

    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Contact not found"), { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update contact"), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json(fail("INVALID_PAYLOAD", "Message id is required"), { status: 400 });
    await db.contactMessage.delete({ where: { id } });
    await emitAdminEvent({ actorId: admin.user.id, eventType: "CONTACT_UPDATED", entity: "contact", entityId: id, payload: { deleted: true } });
    return NextResponse.json(ok({ id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json(fail("NOT_FOUND", "Message not found"), { status: 404 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to delete message"), { status: 500 });
  }
}
