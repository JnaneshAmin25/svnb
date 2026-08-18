import crypto from "crypto";

const SALT_BYTES = 16;
const HASH_BYTES = 32;
const PBKDF2_ITERS = 120_000;
const PBKDF2_DIGEST = "sha256";

function toHex(value: Buffer): string {
  return value.toString("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERS, HASH_BYTES, PBKDF2_DIGEST);
  return `pbkdf2_v1:${toHex(salt)}:${toHex(derived)}`;
}

export function verifyPassword(password: string, encoded: string | null | undefined): boolean {
  if (!encoded) return false;

  const parts = encoded.split(":");
  if (parts.length !== 3 || parts[0] !== "pbkdf2_v1") return false;

  const [_, saltHex, derivedHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(derivedHex, "hex");
  const actual = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERS, HASH_BYTES, PBKDF2_DIGEST);

  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

