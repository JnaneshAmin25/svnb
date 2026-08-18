import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { encryptText } from "@/lib/security/crypto";
import { hashValue as hashText } from "@/lib/utils/hash";
import { normalizePhone } from "@/lib/utils/hash";

const patchSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  roleName: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json(fail("FORBIDDEN", "Admin only"), { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json();
    const payload = patchSchema.parse(body);
    const normalizedPhone = payload.phone ? normalizePhone(payload.phone) : "";
    if (payload.phone && !normalizedPhone) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid phone number"), { status: 400 });
    }
    const normalizedName = payload.fullName ? payload.fullName.trim() : "";
    const data = {
      roleName: payload.roleName,
      isActive: payload.isActive,
      displayOrder: payload.displayOrder,
      ...(payload.fullName
        ? { fullNameCipher: encryptText(normalizedName)!, fullNameHash: hashText(normalizedName) }
        : {}),
      ...(payload.phone
        ? { phoneCipher: encryptText(normalizedPhone)!, phoneHash: hashText(normalizedPhone) }
        : {}),
    };
    const row = await db.teamMember.update({
      where: { id },
      data,
    });

    await emitAdminEvent({
      actorId: admin.user.id,
      eventType: "TEAM_UPDATED",
      entity: "team",
      entityId: id,
    });

    return NextResponse.json(ok({ id: row.id }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(fail("NOT_FOUND", "Team member not found"), { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid payload"), { status: 400 });
    }
    return NextResponse.json(fail("INTERNAL_ERROR", "Unable to update team member"), { status: 500 });
  }
}
