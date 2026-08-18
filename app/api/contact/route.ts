import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getRequestContext } from "@/lib/request";
import { getCachedJSON, setCachedJSON, invalidateCache } from "@/lib/cache";
import { fail, ok } from "@/lib/security/response";
import { encryptText } from "@/lib/security/crypto";
import { hashValue } from "@/lib/utils/hash";
import { verifyCaptcha } from "@/lib/security/captcha";
import { emitAdminEvent } from "@/lib/stream/adminEvents";
import { normalizePhone } from "@/lib/utils/hash";
import { parseFutureDate } from "@/lib/utils/date";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  eventType: z.string().min(2),
  eventDate: z.string().min(3),
  location: z.string().min(2),
  specialRequest: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const normalizedName = payload.name.trim();
    const normalizedPhone = normalizePhone(payload.phone);
    if (!normalizedPhone) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid phone number"), { status: 400 });
    }
    const normalizedEmail = payload.email.trim().toLowerCase();
    const eventDate = parseFutureDate(payload.eventDate);
    if (!eventDate) {
      return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid or past event date"), { status: 400 });
    }

    const ctx = getRequestContext(request);
    const rl = await checkRateLimit(`contact:${ctx.ip}`, 10, 300);
    if (!rl.allowed) return NextResponse.json(fail("RATE_LIMIT", "Too many requests"), { status: 429 });

    const captchaOk = await verifyCaptcha(payload.captchaToken ?? "");
    if (!captchaOk) return NextResponse.json(fail("CAPTCHA_FAILED", "Captcha required"), { status: 400 });

    const message = await db.contactMessage.create({
      data: {
        nameCipher: encryptText(normalizedName) || "",
        nameHash: hashValue(normalizedName),
        phoneCipher: encryptText(normalizedPhone) || "",
        phoneHash: hashValue(normalizedPhone),
        emailCipher: encryptText(normalizedEmail) || "",
        emailHash: hashValue(normalizedEmail),
        eventType: payload.eventType,
        eventDate,
        location: payload.location,
        specialRequest: encryptText(payload.specialRequest || "") || null,
      },
    });
    await emitAdminEvent({
      eventType: "CONTACT_CREATED",
      entity: "contact",
      entityId: message.id,
    });
    await invalidateCache("contacts");

    return NextResponse.json(ok({ id: message.id }));
  } catch {
    return NextResponse.json(fail("INVALID_PAYLOAD", "Invalid contact payload"), { status: 400 });
  }
}

export async function GET() {
  const cacheKey = "contacts:public";
  const cached = await getCachedJSON<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json(ok(cached));

  const fallback = { total: 0 };
  await setCachedJSON(cacheKey, fallback, 30);
  return NextResponse.json(ok(fallback));
}
