import { NextRequest, NextResponse } from "next/server";
import { decryptText } from "@/lib/security/crypto";
import { requireAuth } from "@/lib/auth/session";
import { fail, ok } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const actor = await requireAuth(request);
  if (!actor) return NextResponse.json(fail("UNAUTHORIZED", "Auth required"), { status: 401 });

  return NextResponse.json(
    ok({
      id: actor.user.id,
      role: actor.user.role,
      phone: decryptText(actor.user.phoneCipher) ?? "",
      fullName: actor.user.fullNameCipher ? decryptText(actor.user.fullNameCipher) : null,
      email: actor.user.emailCipher ? decryptText(actor.user.emailCipher) : null,
      username: actor.user.username,
    }),
  );
}
