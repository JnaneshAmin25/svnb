import crypto from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { hmacSha256 } from "@/lib/security/crypto";

type SignupToken = {
  challengeId: string;
  expiresAt: number;
};

const COOKIE_SUFFIX = "_signup";

function signupCookieName() {
  return `${env.SESSION_COOKIE_NAME}${COOKIE_SUFFIX}`;
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function encodeSignupToken(payload: SignupToken) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmacSha256(body)}`;
}

export function readSignupChallengeId(request: NextRequest): string | null {
  const token = request.cookies.get(signupCookieName())?.value;
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature || !signaturesMatch(hmacSha256(body), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Partial<SignupToken>;
    if (
      typeof payload.challengeId !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }
    return payload.challengeId;
  } catch {
    return null;
  }
}

export function attachSignupCookie(
  response: NextResponse,
  challengeId: string,
  expiresAt: Date,
) {
  const maxAge = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  response.cookies.set({
    name: signupCookieName(),
    value: encodeSignupToken({ challengeId, expiresAt: expiresAt.getTime() }),
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/api/auth/complete-signup",
    maxAge,
  });
}

export function clearSignupCookie(response: NextResponse) {
  response.cookies.set({
    name: signupCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/api/auth/complete-signup",
    maxAge: 0,
  });
}
