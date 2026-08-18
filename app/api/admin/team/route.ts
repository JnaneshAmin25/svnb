import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { decryptText, encryptText } from "@/lib/security/crypto";
import { hashValue } from "@/lib/utils/hash";
import { normalizePhone } from "@/lib/utils/hash";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";

const createSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  roleName: z.string().min(2),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  const rows = await db.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(ok({
    items: rows.map((member) => ({
      id: member.id,
      fullName: decryptText(member.fullNameCipher),
      phone: decryptText(member.phoneCipher),
      roleName: member.roleName,
      isActive: member.isActive,
      displayOrder: member.displayOrder,
    })),
  }));
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);
    const phone = normalizePhone(payload.phone);
    if (!phone) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid phone number"), { status: 400 });
    }
    const normalizedName = payload.fullName.trim();

    const row = await db.teamMember.create({
      data: {
        fullNameCipher: encryptText(normalizedName) || "",
        fullNameHash: hashValue(normalizedName),
        phoneCipher: encryptText(phone) || "",
        phoneHash: hashValue(phone),
        roleName: payload.roleName,
        isActive: payload.isActive,
        displayOrder: payload.displayOrder,
      },
    });

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "TEAM_CREATED",
      entity: "team",
      entityId: row.id,
    });

    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid team member payload"), { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(fail("DUPLICATE", "Team member already exists"), { status: 409 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to create team member"), { status: 500 });
  }
}
