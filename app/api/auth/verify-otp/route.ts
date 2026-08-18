import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySignupOtp } from "@/lib/auth/otp";
import { attachSignupCookie } from "@/lib/auth/signup";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getRequestContext } from "@/lib/request";
import { fail, ok } from "@/lib/security/response";
import { hashValue } from "@/lib/utils/hash";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().max(254),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
  purpose: z.literal("signup"),
});

const errorMessage: Record<string, string> = {
  OTP_MISMATCH: "That code is incorrect.",
  OTP_LIMIT_EXCEEDED: "Too many incorrect attempts. Request a new code.",
  OTP_EXPIRED_OR_INVALID: "This code has expired. Request a new code.",
};

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const ctx = getRequestContext(request);
    const rateKey = `${ctx.ip}:${hashValue(email)}`;
    const rl = await checkRateLimit(`otp:verify:${rateKey}`, 10, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many attempts. Try again later."),
        { status: 429 },
      );
    }

    const result = await verifySignupOtp(email, payload.otp);
    if (!result.ok) {
      return NextResponse.json(
        fail(result.code, errorMessage[result.code] ?? "Unable to verify code."),
        { status: 400 },
      );
    }

    const response = NextResponse.json(ok({ emailVerified: true }));
    attachSignupCookie(response, result.challengeId, result.expiresAt);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        fail("INVALID_PAYLOAD", "Enter the 6-digit code."),
        { status: 400 },
      );
    }
    return NextResponse.json(
      fail("INTERNAL_ERROR", "Unable to verify code."),
      { status: 500 },
    );
  }
}
