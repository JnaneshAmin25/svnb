import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { attachSessionCookie } from "@/lib/auth/session";
import { verifyFirebaseLogin } from "@/lib/auth/firebase-verify";
import { getRequestContext } from "@/lib/request";

const bodySchema = z.object({
  idToken: z.string().min(10),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!env.FIREBASE_LOGIN_ENABLED) {
    return NextResponse.json(
      { message: "Firebase login is disabled" },
      { status: 503 },
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 },
    );
  }

  const ctx = getRequestContext(request);

  // Optional Turnstile verification — only enforced when the secret key is set.
  if (env.TURNSTILE_SECRET_KEY) {
    if (!body.captchaToken) {
      return NextResponse.json(
        { message: "Captcha token required" },
        { status: 400 },
      );
    }
    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET_KEY,
            response: body.captchaToken,
            remoteip: ctx.ip,
          }).toString(),
        },
      );
      const verifyJson = (await verifyRes.json()) as { success?: boolean };
      if (!verifyJson.success) {
        return NextResponse.json(
          { message: "Captcha verification failed" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { message: "Captcha verification unreachable" },
        { status: 502 },
      );
    }
  }

  const result = await verifyFirebaseLogin(
    body.idToken,
    request,
    body.fullName,
    body.email,
  );

  if (!result.ok) {
    const status =
      result.code === "FIREBASE_NOT_CONFIGURED" ? 503
      : result.code === "PHONE_MISSING" ? 400
      : result.code === "MISSING_PROFILE" ? 400
      : 401;
    return NextResponse.json(
      { message: friendlyMessage(result.code), code: result.code },
      { status },
    );
  }

  const response = NextResponse.json({ ok: true });
  attachSessionCookie(response, result.token);
  return response;
}

function friendlyMessage(code: string) {
  switch (code) {
    case "FIREBASE_NOT_CONFIGURED":
      return "Phone sign-in is not configured. Contact admin.";
    case "FIREBASE_TOKEN_INVALID":
      return "Phone sign-in session expired. Try again.";
    case "PHONE_MISSING":
      return "Phone number missing on sign-in token.";
    case "MISSING_PROFILE":
      return "Full name and email are required for first-time login.";
    default:
      return "Sign-in failed.";
  }
}
