import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { fail, ok } from "@/lib/security/response";
import { attachSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/credentials";
import { createSessionForUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { getRequestContext } from "@/lib/request";

const schema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const ctx = getRequestContext(request);
    const rl = await checkRateLimit(`admin:login:${ctx.ip}`, 20, 900);
    if (!rl.allowed) {
      return NextResponse.json(fail("RATE_LIMITED", "Too many login attempts"), { status: 429 });
    }

    const username = payload.username.trim().toLowerCase();
    const user = await db.user.findUnique({ where: { username } });
    if (!user || !user.isActive || user.role !== "ADMIN") {
      return NextResponse.json(fail("INVALID_CREDENTIALS", "Invalid credentials"), { status: 401 });
    }

    if (!verifyPassword(payload.password, user.passwordHash)) {
      return NextResponse.json(fail("INVALID_CREDENTIALS", "Invalid credentials"), { status: 401 });
    }

    const token = await createSessionForUser(user.id, request);
    const response = NextResponse.json(ok({ loggedIn: true, userId: user.id }));
    attachSessionCookie(response, token);

    await emitAdminEvent({
      actorId: user.id,
      eventType: "ADMIN_LOGGED_IN",
      entity: "auth",
      entityId: user.id,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to login"), { status: 500 });
  }
}
