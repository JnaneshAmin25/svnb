import crypto from "crypto";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { sendOtpEmail } from "@/lib/email/send";
import { encryptText } from "@/lib/security/crypto";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { hashValue, randomDigits } from "@/lib/utils/hash";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeHashMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function issueSignupOtp(
  rawEmail: string,
  _request: NextRequest,
  captchaOk: boolean,
) {
  if (!captchaOk) return { ok: false as const, code: "CAPTCHA_FAILED" };

  const email = normalizeEmail(rawEmail);
  const emailHash = hashValue(email);
  const existing = await db.user.findUnique({ where: { emailHash } });
  if (existing) return { ok: false as const, code: "ACCOUNT_EXISTS" };

  const code = randomDigits(env.OTP_LENGTH);
  const codeHash = hashValue(`${email}:${code}`);
  const now = new Date();

  await db.otpChallenge.updateMany({
    where: {
      channel: "email",
      emailHash,
      purpose: "SIGNUP",
      consumedAt: null,
    },
    data: { consumedAt: now },
  });

  const challenge = await db.otpChallenge.create({
    data: {
      channel: "email",
      emailHash,
      emailCipher: encryptText(email),
      purpose: "SIGNUP",
      codeHash,
      maxAttempts: env.OTP_MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + env.OTP_TTL_SECONDS * 1000),
    },
  });

  const delivered = await sendOtpEmail(email, code, "signup");
  if (!delivered) {
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false as const, code: "DELIVERY_FAILED" };
  }

  if (env.NODE_ENV !== "production") {
    console.info(`[OTP DEBUG] signup:${email} => ${code}`);
  }

  await emitAdminEvent({
    eventType: "OTP_REQUEST",
    entity: "otp",
    entityId: emailHash,
  });

  return { ok: true as const, expiresAt: challenge.expiresAt };
}

export async function verifySignupOtp(rawEmail: string, code: string) {
  const email = normalizeEmail(rawEmail);
  const emailHash = hashValue(email);
  const expectedHash = hashValue(`${email}:${code}`);
  const challenge = await db.otpChallenge.findFirst({
    where: {
      channel: "email",
      emailHash,
      purpose: "SIGNUP",
      verifiedAt: null,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return { ok: false as const, code: "OTP_EXPIRED_OR_INVALID" };
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false as const, code: "OTP_LIMIT_EXCEEDED" };
  }
  if (!safeHashMatch(challenge.codeHash, expectedHash)) {
    const nextAttempts = challenge.attempts + 1;
    await db.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attempts: { increment: 1 },
        ...(nextAttempts >= challenge.maxAttempts
          ? { consumedAt: new Date() }
          : {}),
      },
    });
    return { ok: false as const, code: "OTP_MISMATCH" };
  }

  const verifiedAt = new Date();
  await db.otpChallenge.update({
    where: { id: challenge.id },
    data: { verifiedAt },
  });

  return {
    ok: true as const,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
  };
}
