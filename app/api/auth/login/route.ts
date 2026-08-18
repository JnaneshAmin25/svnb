import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/credentials";
import {
  attachSessionCookie,
  createSessionForUser,
} from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { getRequestContext } from "@/lib/request";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { verifyCaptcha } from "@/lib/security/captcha";
import { fail, ok } from "@/lib/security/response";
import { hashValue } from "@/lib/utils/hash";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
  captchaToken: z.string().optional(),
});

const DUMMY_PASSWORD_HASH = hashPassword("invalid-password-timing-value");

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const emailHash = hashValue(email);
    const ctx = getRequestContext(request);
    const rl = await checkRateLimit(`login:${ctx.ip}:${emailHash}`, 10, 900);
    if (!rl.allowed) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many login attempts. Try again later."),
        { status: 429 },
      );
    }

    if (!(await verifyCaptcha(payload.captchaToken))) {
      return NextResponse.json(
        fail("CAPTCHA_FAILED", "Please complete the security check and try again."),
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { emailHash } });
    const passwordMatches = verifyPassword(
      payload.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !user.isActive || !user.username || !passwordMatches) {
      return NextResponse.json(
        fail("INVALID_CREDENTIALS", "Incorrect email or password."),
        { status: 401 },
      );
    }

    const token = await createSessionForUser(user.id, request);
    const response = NextResponse.json(ok({ loggedIn: true }));
    attachSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        fail("INVALID_PAYLOAD", "Enter a valid email and password."),
        { status: 400 },
      );
    }
    console.error(
      "[auth/login] Login failed",
      error instanceof Error ? error.message : "Unknown login error",
    );
    return NextResponse.json(
      fail("SERVICE_UNAVAILABLE", "Login is temporarily unavailable. Please try again shortly."),
      { status: 503 },
    );
  }
}
