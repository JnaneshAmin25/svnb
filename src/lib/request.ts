import type { NextRequest } from "next/server";

export type RequestContext = {
  ip: string;
  userAgent: string | null;
  idempotencyKey: string | null;
};

function firstIpValue(value: string | null): string {
  if (!value) return "unknown";
  return value.split(",")[0]?.trim() || "unknown";
}

export function getRequestContext(request: NextRequest): RequestContext {
  const ip =
    firstIpValue(request.headers.get("x-forwarded-for")) ||
    firstIpValue(request.headers.get("x-real-ip")) ||
    "unknown";
  const userAgent = request.headers.get("user-agent");
  const idempotencyKey = request.headers.get("idempotency-key");
  return { ip, userAgent, idempotencyKey };
}

