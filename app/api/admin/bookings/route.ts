import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { decryptText, encryptText } from "@/lib/security/crypto";
import { hashValue, normalizePhone } from "@/lib/utils/hash";
import { parseFutureDate } from "@/lib/utils/date";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { invalidateCache } from "@/lib/cache";
import { sendTransactionalEmail } from "@/lib/email/send";

const createSchema = z.object({
  phone: z.string().min(8),
  fullName: z.string().min(2),
  email: z.string().email(),
  eventType: z.string().min(2),
  eventDate: z.string().min(3),
  location: z.string().min(2),
  specialRequest: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});
const statusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]);

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const rawLimit = url.searchParams.get("limit");
  const take = Math.min(Number.isFinite(Number(rawLimit)) ? Number(rawLimit) : 50, 100);
  const parsedStatus = status ? statusSchema.safeParse(status) : null;
  if (status && !parsedStatus?.success) {
    return NextResponse.json(fail("INVALID_FILTER", "Invalid booking status"), { status: 400 });
  }
  const where = parsedStatus ? { status: parsedStatus.data, isDeleted: false } : { isDeleted: false };

  const items = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: { user: true },
  });

  const rows = items.map((item) => ({
    id: item.id,
    status: item.status,
    eventType: item.eventType,
    eventDate: item.eventDate.toISOString(),
    location: item.location,
    specialRequest: item.specialRequest,
    createdAt: item.createdAt.toISOString(),
    user: {
      phone: decryptText(item.user.phoneCipher) || "",
      fullName: item.user.fullNameCipher ? decryptText(item.user.fullNameCipher) : null,
      email: item.user.emailCipher ? decryptText(item.user.emailCipher) : null,
    },
  }));

  return NextResponse.json(ok({ items: rows }));
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);
    const eventDate = parseFutureDate(payload.eventDate);
    if (!eventDate) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid or past event date"), { status: 400 });
    }
    const phone = normalizePhone(payload.phone);
    if (!phone) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid phone number"), { status: 400 });
    }
    const phoneHash = hashValue(phone);
    const normalizedFullName = payload.fullName.trim();
    const normalizedEmail = payload.email.trim().toLowerCase();

    let user = await db.user.findUnique({ where: { phoneHash } });
    if (!user) {
      user = await db.user.create({
        data: {
          phoneHash,
          phoneCipher: encryptText(phone) || "",
          fullNameCipher: encryptText(normalizedFullName),
          fullNameHash: hashValue(normalizedFullName),
          emailCipher: encryptText(normalizedEmail),
          emailHash: hashValue(normalizedEmail),
          role: "USER",
        },
      });
    } else {
      await db.user.update({
        where: { id: user.id },
        data: {
          fullNameCipher: encryptText(normalizedFullName),
          fullNameHash: hashValue(normalizedFullName),
          emailCipher: encryptText(normalizedEmail),
          emailHash: hashValue(normalizedEmail),
        },
      });
    }

    const booking = await db.booking.create({
      data: {
        userId: user.id,
        adminId: admin.user.id,
        eventType: payload.eventType,
        eventDate,
        location: payload.location,
        specialRequest: payload.specialRequest ?? null,
        status: payload.status ?? "PENDING",
      },
    });

    try {
      if (normalizedEmail) {
        await sendTransactionalEmail(normalizedEmail, "Your booking request has been created", [
          "Hi!",
          `Your booking request (${booking.id}) has been created by admin.`,
          `Event: ${payload.eventType}`,
          `Date: ${booking.eventDate.toISOString().slice(0, 10)}`,
          `Location: ${payload.location}`,
          `Status: ${booking.status}`,
          "You can log in to view all booking details.",
        ]);
      }
    } catch {
      // email failures are non-blocking for admin booking flow
    }

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "BOOKING_CREATED",
      entity: "booking",
      entityId: booking.id,
      payload: { by: "admin" },
    });
    await invalidateCache(`bookings:user:${user.id}`);
    return NextResponse.json(ok({ id: booking.id }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(fail("DATABASE_ERROR", "Unable to save the booking."), { status: 500 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to create booking"), { status: 500 });
  }
}
