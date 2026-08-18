import crypto from "crypto";
import { env } from "@/lib/env";

export function hashValue(value: string): string {
  return crypto
    .createHash("sha256")
    .update(`${env.PII_HASH_SALT}:${value}`)
    .digest("hex");
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function randomDigits(length: number): string {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, "0");
}
