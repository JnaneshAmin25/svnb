import type { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { hmacSha256 } from "@/lib/security/crypto";
import { hashValue } from "@/lib/utils/hash";
import { getRequestContext } from "@/lib/request";
import { randomBytes } from "crypto";

export type AuthActor = {
  id: string;
  role: "USER" | "ADMIN";
  phoneHash: string | null;
  phoneCipher: string | null;
  fullNameCipher: string | null;
  emailCipher: string | null;
  username: string | null;
};

type SessionWithUser = {
  id: string;
  user: AuthActor;
};

export async function getAuthActor(request: NextRequest): Promise<SessionWithUser | null> {
  const token = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hmacSha256(token);
  const record = await db.session.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!record || !record.user.isActive) return null;

  await db.session.update({
    where: { id: record.id },
    data: { lastSeenAt: new Date() },
  });

  return {
    id: record.id,
    user: {
      id: record.user.id,
      role: record.user.role,
      phoneHash: record.user.phoneHash,
      phoneCipher: record.user.phoneCipher,
      fullNameCipher: record.user.fullNameCipher ?? null,
      emailCipher: record.user.emailCipher ?? null,
      username: record.user.username ?? null,
    },
  };
}

export async function requireAuth(request: NextRequest): Promise<SessionWithUser | null> {
  return getAuthActor(request);
}

export async function requireAdmin(request: NextRequest) {
  const actor = await getAuthActor(request);
  if (!actor || actor.user.role !== "ADMIN") return null;
  return actor;
}

function issueToken() {
  return randomBytes(32).toString("hex");
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
) {
  const inDev = env.NODE_ENV !== "production";
  response.cookies.set({
    name: env.SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: !inDev,
    path: "/",
    maxAge: env.SESSION_TTL_SECONDS,
  });
}

export async function createSessionForUser(
  userId: string,
  request: NextRequest,
) {
  const ctx = getRequestContext(request);
  const token = issueToken();
  const hash = hmacSha256(token);

  await db.session.create({
    data: {
      userId,
      tokenHash: hash,
      ipHash: hashValue(ctx.ip),
      userAgent: ctx.userAgent,
      expiresAt: new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000),
      lastSeenAt: new Date(),
    },
  });
  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });

  return token;
}

export async function destroySession(token: string) {
  const tokenHash = hmacSha256(token);
  await db.session.deleteMany({
    where: { tokenHash },
  });
}
