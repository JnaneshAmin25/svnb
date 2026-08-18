import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decryptText, encryptText } from "@/lib/security/crypto";
import { db } from "@/lib/db/client";
import { requireAuth } from "@/lib/auth/session";
import { getCachedJSON, setCachedJSON, invalidateCache } from "@/lib/cache";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { env } from "@/lib/env";

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().min(5),
  bookingId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const actor = await requireAuth(request);
  if (!actor) return NextResponse.json(fail("UNAUTHORIZED", "Login required"), { status: 401 });

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);

    const row = await db.review.create({
      data: {
        userId: actor.user.id,
        bookingId: payload.bookingId ?? null,
        rating: payload.rating,
        messageCipher: encryptText(payload.message) || "",
        status: "PENDING",
      },
    });

    await emitAdminEvent({
      actorId: actor.user.id,
      eventType: "REVIEW_CREATED",
      entity: "review",
      entityId: row.id,
    });
    await invalidateCache("reviews:approved:v1");

    return NextResponse.json(ok({ id: row.id }));
  } catch {
    return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid review payload"), { status: 400 });
  }
}

export async function GET() {
  const cacheKey = "reviews:approved:v1";
  const cached = await getCachedJSON<{
    items: { id: string; rating: number; message: string; createdAt: string }[];
  }>(cacheKey);

  if (cached) return NextResponse.json(ok(cached));

  const rows = await db.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: env.DEFAULT_LIST_LIMIT,
  });

  const payload = {
    items: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      message: row.messageCipher ? decryptText(row.messageCipher) ?? "" : "",
      createdAt: row.createdAt.toISOString(),
    })),
  };

  await setCachedJSON(cacheKey, payload, 45);
  return NextResponse.json(ok(payload));
}
