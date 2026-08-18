import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const [bookingCount, reviewCount, contactCount, userCount, galleryCount] = await Promise.all([
    db.booking.count(),
    db.review.count(),
    db.contactMessage.count(),
    db.user.count(),
    db.galleryItem.count(),
  ]);

  const recent = await db.adminEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json(ok({
    counts: {
      bookingCount,
      reviewCount,
      contactCount,
      userCount,
      galleryCount,
    },
    recentEvents: recent,
  }));
}

