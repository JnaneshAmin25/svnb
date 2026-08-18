import crypto from "crypto";
import { env } from "@/lib/env";

const ALGO = "aes-256-gcm";

function keyFromSecret(): Buffer {
  const raw = env.ENCRYPTION_KEY;
  if (raw.length === 0) {
    throw new Error("ENCRYPTION_KEY is required");
  }

  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    const buff = Buffer.from(raw, "base64");
    if (buff.length >= 32) return buff.subarray(0, 32);
  }

  const digest = crypto.createHash("sha256").update(raw).digest();
  return digest;
}

function toBuffer(value: string): Buffer {
  return Buffer.from(value, "base64");
}

export function encryptText(plain?: string | null): string | null {
  if (!plain) return null;
  const key = keyFromSecret();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}::${tag.toString("base64")}::${encrypted.toString(
    "base64",
  )}`;
}

export function decryptText(cipherText?: string | null): string | null {
  if (!cipherText) return null;
  const key = keyFromSecret();
  const [ivPart, tagPart, encryptedPart] = cipherText.split("::");
  if (!ivPart || !tagPart || !encryptedPart) return null;

  const iv = toBuffer(ivPart);
  const tag = toBuffer(tagPart);
  const encrypted = toBuffer(encryptedPart);

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decoded = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decoded.toString("utf8");
}

export function hmacSha256(value: string): string {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}
