// One-off: insert the admin user defined in ADMIN_CREDENTIALS / ADMIN_PHONES
// of .env.local. Mirrors the logic of prisma/seed.ts but runs as plain ESM
// (no tsx needed) so it works without the "prisma.seed" config in
// package.json. Re-runnable; uses upsert semantics on phoneHash / username.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// 1) Load .env.local into process.env (Prisma client reads process.env).
const envPath = resolve(process.cwd(), ".env.local");
const text = readFileSync(envPath, "utf8");
for (const line of text.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let key = line.slice(0, i).trim();
  let value = line.slice(i + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  process.env[key] = value;
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const PII_HASH_SALT = process.env.PII_HASH_SALT;

function hashValue(value) {
  return crypto
    .createHash("sha256")
    .update(`${PII_HASH_SALT}:${value}`)
    .digest("hex");
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function encryptText(plain) {
  if (!plain) return null;
  let keyBuf;
  if (/^[A-Za-z0-9+/=]+$/.test(ENCRYPTION_KEY)) {
    const buff = Buffer.from(ENCRYPTION_KEY, "base64");
    if (buff.length >= 32) keyBuf = buff.subarray(0, 32);
  }
  if (!keyBuf) keyBuf = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuf, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}::${tag.toString("base64")}::${enc.toString("base64")}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, 120_000, 32, "sha256");
  return `pbkdf2_v1:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function main() {
  const adminPhones = (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const phone of adminPhones) {
    const normalized = normalizePhone(phone);
    if (!normalized) continue;
    const phoneHash = hashValue(normalized);
    await prisma.user.upsert({
      where: { phoneHash },
      create: {
        phoneHash,
        phoneCipher: encryptText(normalized) || "",
        role: "ADMIN",
      },
      update: { role: "ADMIN" },
    });
    console.log(`upserted admin by phone: ${normalized}`);
  }

  const creds = process.env.ADMIN_CREDENTIALS
    ? JSON.parse(process.env.ADMIN_CREDENTIALS)
    : [];

  for (const c of creds) {
    const normalizedUsername = c.username.trim().toLowerCase();
    const normalizedPhone = normalizePhone(c.phone);
    if (!normalizedPhone) continue;

    const phoneHash = hashValue(normalizedPhone);
    const fullNameCipher = c.fullName ? encryptText(c.fullName) : null;
    const emailCipher = c.email ? encryptText(c.email) : null;

    const byUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (byUsername) {
      await prisma.user.update({
        where: { id: byUsername.id },
        data: {
          role: "ADMIN",
          isActive: c.isActive ?? true,
          phoneHash,
          phoneCipher: encryptText(normalizedPhone) || "",
          passwordHash: hashPassword(c.password),
          username: normalizedUsername,
          fullNameCipher: fullNameCipher ?? byUsername.fullNameCipher,
          fullNameHash: c.fullName ? hashValue(c.fullName) : byUsername.fullNameHash,
          emailCipher: emailCipher ?? byUsername.emailCipher,
          emailHash: c.email ? hashValue(c.email) : byUsername.emailHash,
        },
      });
      console.log(`updated admin by username: ${normalizedUsername}`);
      continue;
    }

    const byPhone = await prisma.user.findUnique({ where: { phoneHash } });
    if (byPhone) {
      await prisma.user.update({
        where: { id: byPhone.id },
        data: {
          role: "ADMIN",
          isActive: c.isActive ?? true,
          username: normalizedUsername,
          passwordHash: hashPassword(c.password),
          fullNameCipher: fullNameCipher ?? byPhone.fullNameCipher,
          fullNameHash: c.fullName ? hashValue(c.fullName) : byPhone.fullNameHash,
          emailCipher: emailCipher ?? byPhone.emailCipher,
          emailHash: c.email ? hashValue(c.email) : byPhone.emailHash,
        },
      });
      console.log(`updated admin by phone: ${normalizedUsername}`);
      continue;
    }

    await prisma.user.create({
      data: {
        phoneHash,
        phoneCipher: encryptText(normalizedPhone) || "",
        role: "ADMIN",
        isActive: c.isActive ?? true,
        username: normalizedUsername,
        passwordHash: hashPassword(c.password),
        fullNameCipher,
        fullNameHash: c.fullName ? hashValue(c.fullName) : null,
        emailCipher,
        emailHash: c.email ? hashValue(c.email) : null,
      },
    });
    console.log(`created admin: ${normalizedUsername}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });