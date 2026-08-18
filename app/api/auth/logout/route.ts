import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { destroySession } from "@/lib/auth/session";
import { ok } from "@/lib/security/response";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json(ok({ loggedOut: true }));
  response.cookies.set({
    name: env.SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
