import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { invalidateCache } from "@/lib/cache";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { parseFutureDate } from "@/lib/utils/date";

const createSchema = z.object({
  eventType: z.string().min(2),
  eventDate: z.string().min(4),
  location: z.string().min(2),
  specialRequest: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const actor = await requireAuth(request);
  if (!actor) return NextResponse.json(fail("UNAUTHORIZED", "Login required"), { status: 401 });

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);
    const eventDate = parseFutureDate(payload.eventDate);
    if (!eventDate) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid or past event date"), { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        userId: actor.user.id,
        eventType: payload.eventType,
        eventDate,
        location: payload.location,
        specialRequest: payload.specialRequest ?? null,
        status: "PENDING",
      },
    });

    await invalidateCache("bookings:user:");
    await emitAdminEvent({
      actorId: actor.user.id,
      eventType: "BOOKING_CREATED",
      entity: "booking",
      entityId: booking.id,
      payload: {
        eventType: payload.eventType,
        location: payload.location,
        bookingId: booking.id,
      },
    });

    return NextResponse.json(ok({ id: booking.id }));
  } catch {
    return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid booking payload"), { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const actor = await requireAuth(request);
  if (!actor) return NextResponse.json(fail("UNAUTHORIZED", "Login required"), { status: 401 });

  const url = new URL(request.url);
  const take = Math.min(Number(url.searchParams.get("limit") || "20"), 50);
  const skip = Number(url.searchParams.get("offset") || "0");

  const rows = await db.booking.findMany({
    where: { userId: actor.user.id, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(take) ? take : 20,
    skip: Number.isFinite(skip) ? skip : 0,
  });

  return NextResponse.json(ok({ items: rows }));
}
