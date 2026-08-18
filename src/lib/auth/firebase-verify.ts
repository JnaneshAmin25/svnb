import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { encryptText } from "@/lib/security/crypto";
import { hashValue, normalizePhone } from "@/lib/utils/hash";
import { createSessionForUser } from "@/lib/auth/session";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { isFirebaseAdminConfigured, verifyFirebaseIdToken } from "@/lib/auth/firebase-admin";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

/**
 * Exchange a Firebase ID token (from client-side Phone Auth) for an
 * SVNB session cookie. Returns the session token to set on the response.
 *
 * The flow mirrors verifyOtp so user/admin roles, profile persistence, and
 * admin-event logging behave the same way as the server-issued OTP path.
 */
export async function verifyFirebaseLogin(
  idToken: string,
  request: NextRequest,
  fullName?: string,
  email?: string,
) {
  if (!isFirebaseAdminConfigured()) {
    return { ok: false as const, code: "FIREBASE_NOT_CONFIGURED" };
  }

  const decoded = await verifyFirebaseIdToken(idToken);
  if (!decoded) {
    return { ok: false as const, code: "FIREBASE_TOKEN_INVALID" };
  }

  const rawPhone = decoded.phone_number;
  const normalized = normalizePhone(rawPhone || "");
  if (!normalized || normalized.length < 8) {
    return { ok: false as const, code: "PHONE_MISSING" };
  }

  const phoneHash = hashValue(normalized);
  const normalizedEmail = email?.trim().toLowerCase() || (decoded.email ?? null);
  const normalizedName = fullName?.trim() || decoded.name || null;

  const normalizedAdmins = (env.ADMIN_PHONES || "")
    .split(",")
    .map((p) => normalizePhone(p))
    .filter(Boolean);

  const existing = await db.user.findUnique({ where: { phoneHash } });
  const isKnownAdminPhone = normalizedAdmins.includes(normalized);
  const shouldRequireProfile =
    !(existing?.role === "ADMIN" || isKnownAdminPhone);

  if (shouldRequireProfile && (!normalizedName || !normalizedEmail)) {
    return { ok: false as const, code: "MISSING_PROFILE" };
  }

  const role: Role = normalizedAdmins.includes(normalized)
    ? "ADMIN"
    : existing?.role ?? "USER";

  const userPayload = {
    phoneHash,
    phoneCipher: encryptText(normalized) || "",
    fullNameCipher: normalizedName ? encryptText(normalizedName) : existing?.fullNameCipher ?? null,
    fullNameHash: normalizedName ? hashValue(normalizedName) : existing?.fullNameHash ?? null,
    emailCipher: normalizedEmail ? encryptText(normalizedEmail) : existing?.emailCipher ?? null,
    emailHash: normalizedEmail ? hashValue(normalizedEmail) : existing?.emailHash ?? null,
    role,
  };

  let userId = existing?.id;
  if (!userId) {
    const row = await db.user.create({ data: userPayload });
    userId = row.id;
  } else {
    await db.user.update({ where: { id: userId }, data: userPayload });
  }

  await emitAdminEvent({
    actorId: userId,
    eventType: "ADMIN_LOGGED_IN",
    entity: "user",
    entityId: userId,
    payload: { provider: "firebase" },
  });

  const token = await createSessionForUser(userId, request);
  return { ok: true as const, token, userId };
}
