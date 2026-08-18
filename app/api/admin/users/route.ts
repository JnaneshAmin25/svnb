import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { decryptText, encryptText } from "@/lib/security/crypto";
import { fail, ok } from "@/lib/security/response";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/credentials";
import { hashValue, normalizePhone } from "@/lib/utils/hash";

const roleSchema = z.enum(["USER", "ADMIN"]);
const updateSchema = z.object({
  id: z.string().min(1),
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => value.role !== undefined || value.isActive !== undefined, {
  message: "At least one change is required",
});
const createSchema = z.object({
  email: z.string().trim().email().max(254),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(12).max(128),
  fullName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(24).optional(),
  role: roleSchema.default("USER"),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const parsedRole = role ? roleSchema.safeParse(role) : null;
  if (role && !parsedRole?.success) {
    return NextResponse.json(fail("INVALID_FILTER", "Invalid role filter"), { status: 400 });
  }
  const rows = await db.user.findMany({
    where: parsedRole ? { role: parsedRole.data } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  return NextResponse.json(
    ok({
      items: rows.map((user) => ({
        id: user.id,
        role: user.role,
        username: user.username,
        phone: decryptText(user.phoneCipher) || "",
        fullName: user.fullNameCipher ? decryptText(user.fullNameCipher) : null,
        email: user.emailCipher ? decryptText(user.emailCipher) : null,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        bookings: user._count.bookings,
        reviews: user._count.reviews,
      })),
    }),
  );
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });
  try {
    const payload = createSchema.parse(await request.json());
    const email = payload.email.toLowerCase();
    const username = payload.username.toLowerCase();
    const phone = payload.phone ? normalizePhone(payload.phone) : "";
    if (payload.phone && (phone.length < 10 || phone.length > 15)) {
      return NextResponse.json(fail("INVALID_PHONE", "Enter a valid mobile number with 10–15 digits."), { status: 400 });
    }
    const user = await db.user.create({
      data: {
        emailHash: hashValue(email),
        emailCipher: encryptText(email),
        username,
        passwordHash: hashPassword(payload.password),
        fullNameCipher: payload.fullName ? encryptText(payload.fullName) : null,
        fullNameHash: payload.fullName ? hashValue(payload.fullName) : null,
        phoneHash: phone ? hashValue(phone) : null,
        phoneCipher: phone ? encryptText(phone) : null,
        role: payload.role,
      },
    });
    return NextResponse.json(ok({ id: user.id }));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json(fail("INVALID_PAYLOAD", "Check the account details and use a password of at least 12 characters."), { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json(fail("ACCOUNT_EXISTS", "The email, username, or mobile number is already in use."), { status: 409 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to create user."), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const payload = updateSchema.parse(await request.json());
    if (payload.id === admin.user.id && (payload.role === "USER" || payload.isActive === false)) {
      return NextResponse.json(fail("SELF_LOCKOUT", "You cannot remove your own admin access."), { status: 400 });
    }
    const user = await db.user.update({
      where: { id: payload.id },
      data: { role: payload.role, isActive: payload.isActive },
    });
    if (payload.isActive === false) {
      await db.session.deleteMany({ where: { userId: user.id } });
    }
    return NextResponse.json(ok({ id: user.id, role: user.role, isActive: user.isActive }));
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid user update."), { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json(fail("NOT_FOUND", "User not found."), { status: 404 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update user."), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json(fail("INVALID_PAYLOAD", "User id is required."), { status: 400 });
    if (id === admin.user.id) return NextResponse.json(fail("SELF_LOCKOUT", "You cannot deactivate your own account."), { status: 400 });
    await db.$transaction([
      db.user.update({ where: { id }, data: { isActive: false } }),
      db.session.deleteMany({ where: { userId: id } }),
    ]);
    return NextResponse.json(ok({ id, isActive: false }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json(fail("NOT_FOUND", "User not found."), { status: 404 });
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to deactivate user."), { status: 500 });
  }
}
