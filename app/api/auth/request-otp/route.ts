import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { issueSignupOtp } from "@/lib/auth/otp";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getRequestContext } from "@/lib/request";
import { verifyCaptcha } from "@/lib/security/captcha";
import { fail, ok } from "@/lib/security/response";
import { hashValue } from "@/lib/utils/hash";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().max(254),
  purpose: z.literal("signup"),
  captchaToken: z.string().optional(),
});

const errorMessage: Record<string, string> = {
  CAPTCHA_FAILED: "Please complete the security check and try again.",
  ACCOUNT_EXISTS: "An account already exists for this email. Sign in instead.",
  DELIVERY_FAILED: "We could not send the code. Please try again shortly.",
};

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const ctx = getRequestContext(request);
    const rateKey = `${ctx.ip}:${hashValue(email)}`;
    const rl = await checkRateLimit(`otp:request:${rateKey}`, 5, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many code requests. Try again later."),
        { status: 429 },
      );
    }

    const captchaOk = await verifyCaptcha(payload.captchaToken);
    const result = await issueSignupOtp(email, request, captchaOk);
    if (!result.ok) {
      const status = result.code === "ACCOUNT_EXISTS" ? 409 : result.code === "DELIVERY_FAILED" ? 503 : 400;
      return NextResponse.json(
        fail(result.code, errorMessage[result.code] ?? "Unable to send code."),
        { status },
      );
    }

    return NextResponse.json(
      ok({ ttlSeconds: env.OTP_TTL_SECONDS, channel: "email" as const }),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        fail("INVALID_PAYLOAD", "Enter a valid email address."),
        { status: 400 },
      );
    }
    console.error(
      "[auth/request-otp] Request failed",
      error instanceof Error ? error.stack || error.message : "Unknown OTP request error",
      { name: error instanceof Error ? error.name : undefined },
    );
    return NextResponse.json(
      fail("SERVICE_UNAVAILABLE", "Signup is temporarily unavailable. Please try again shortly.", {
        debug: error instanceof Error ? error.message : String(error),
      }),
      { status: 503 },
    );
  }
}
