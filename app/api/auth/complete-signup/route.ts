import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/credentials";
import {
  clearSignupCookie,
  readSignupChallengeId,
} from "@/lib/auth/signup";
import {
  attachSessionCookie,
  createSessionForUser,
} from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { fail, ok } from "@/lib/security/response";

const schema = z.object({
  password: z.string().min(12).max(128),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+$/),
});

export async function POST(request: NextRequest) {
  const challengeId = readSignupChallengeId(request);
  if (!challengeId) {
    return NextResponse.json(
      fail("EMAIL_VERIFICATION_REQUIRED", "Verify your email before creating an account."),
      { status: 401 },
    );
  }

  try {
    const payload = schema.parse(await request.json());
    const username = payload.username.toLowerCase();
    const passwordHash = hashPassword(payload.password);

    const user = await db.$transaction(async (tx) => {
      const challenge = await tx.otpChallenge.findFirst({
        where: {
          id: challengeId,
          purpose: "SIGNUP",
          channel: "email",
          verifiedAt: { not: null },
          consumedAt: null,
          expiresAt: { gt: new Date() },
          emailHash: { not: null },
          emailCipher: { not: null },
        },
      });
      if (!challenge?.emailHash || !challenge.emailCipher) {
        throw new SignupExpiredError();
      }

      const claimed = await tx.otpChallenge.updateMany({
        where: { id: challenge.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (claimed.count !== 1) throw new SignupExpiredError();

      return tx.user.create({
        data: {
          emailHash: challenge.emailHash,
          emailCipher: challenge.emailCipher,
          username,
          passwordHash,
          role: "USER",
        },
      });
    });

    const sessionToken = await createSessionForUser(user.id, request);
    const response = NextResponse.json(ok({ accountCreated: true }));
    attachSessionCookie(response, sessionToken);
    clearSignupCookie(response);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        fail(
          "INVALID_PAYLOAD",
          "Use a 12–128 character password and a 3–30 character username containing only letters, numbers, dots, dashes, or underscores.",
        ),
        { status: 400 },
      );
    }
    if (error instanceof SignupExpiredError) {
      return NextResponse.json(
        fail("SIGNUP_EXPIRED", "Verification expired. Start again with your email."),
        { status: 401 },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : "";
      const detail = target.includes("username")
        ? "That username is already taken."
        : "An account already exists for this email.";
      return NextResponse.json(fail("ACCOUNT_CONFLICT", detail), { status: 409 });
    }
    return NextResponse.json(
      fail("INTERNAL_ERROR", "Unable to create account."),
      { status: 500 },
    );
  }
}

class SignupExpiredError extends Error {}
