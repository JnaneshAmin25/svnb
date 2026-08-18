import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { sendTransactionalEmail } from "@/lib/email/send";
import { decryptText } from "@/lib/security/crypto";

const editSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  eventType: z.string().trim().min(2).optional(),
  eventDate: z.string().min(3).optional(),
  location: z.string().trim().min(2).optional(),
  specialRequest: z.string().max(2000).nullable().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), { message: "At least one change is required" });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const payload = editSchema.parse(body);
    const eventDate = payload.eventDate ? new Date(payload.eventDate) : undefined;
    if (eventDate && Number.isNaN(eventDate.getTime())) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid event date"), { status: 400 });
    }
    const row = await db.booking.update({
      where: { id, isDeleted: false },
      data: {
        status: payload.status,
        eventType: payload.eventType,
        eventDate,
        location: payload.location,
        specialRequest: payload.specialRequest,
      },
      include: { user: true },
    });

    const recipientEmail = row.user.emailCipher ? decryptText(row.user.emailCipher) : null;
    if (recipientEmail) {
      try {
        await sendTransactionalEmail(
          recipientEmail,
          "Your booking status has been updated",
          [
            "Hi,",
            "Your booking status has been updated by admin.",
            `Booking ID: ${row.id}`,
            `Status: ${row.status}`,
            `Event: ${row.eventType}`,
            "You can log in to view all booking details.",
          ],
        );
      } catch {
        // email failures are non-blocking for admin updates
      }
    }

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "BOOKING_UPDATED",
      entity: "booking",
      entityId: id,
      payload: { status: row.status },
    });

    return NextResponse.json(ok({ status: row.status }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Booking not found"), { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update booking"), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });
  try {
    const { id } = await params;
    await db.booking.update({ where: { id, isDeleted: false }, data: { isDeleted: true } });
    await emitAdminEvent({ actorId: admin.user.id, eventType: "BOOKING_UPDATED", entity: "booking", entityId: id, payload: { deleted: true } });
    return NextResponse.json(ok({ id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json(fail("NOT_FOUND", "Booking not found"), { status: 404 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to delete booking"), { status: 500 });
  }
}
