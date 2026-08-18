import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { encryptText } from "@/lib/security/crypto";
import { fail, ok } from "@/lib/security/response";
import { hashValue, normalizePhone } from "@/lib/utils/hash";

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+$/),
  phone: z.string().trim().max(24),
});

export async function PATCH(request: NextRequest) {
  const actor = await requireAuth(request);
  if (!actor) {
    return NextResponse.json(fail("UNAUTHORIZED", "Sign in to update your profile."), { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const username = payload.username.toLowerCase();
    const phone = normalizePhone(payload.phone);
    if (phone && (phone.length < 10 || phone.length > 15)) {
      return NextResponse.json(
        fail("INVALID_PHONE", "Enter a valid mobile number with 10–15 digits."),
        { status: 400 },
      );
    }

    await db.user.update({
      where: { id: actor.user.id },
      data: {
        username,
        phoneHash: phone ? hashValue(phone) : null,
        phoneCipher: phone ? encryptText(phone) : null,
      },
    });

    return NextResponse.json(ok({ username, phone }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        fail("INVALID_PAYLOAD", "Check the username and mobile number."),
        { status: 400 },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : "";
      const detail = target.includes("username")
        ? "That username is already taken."
        : "That mobile number is already linked to another account.";
      return NextResponse.json(fail("PROFILE_CONFLICT", detail), { status: 409 });
    }
    return NextResponse.json(
      fail("INTERNAL_ERROR", "Unable to update your profile."),
      { status: 500 },
    );
  }
}
