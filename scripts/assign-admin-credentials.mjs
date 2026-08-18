// Assigns the admin username/password defined in ADMIN_CREDENTIALS directly
// to the existing phone-based admin user (created from ADMIN_PHONES). This
// avoids the emailHash collision with the existing USER account.
//
// Idempotent: re-running is safe.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, 120_000, 32, "sha256");
  return `pbkdf2_v1:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function main() {
  const creds = process.env.ADMIN_CREDENTIALS
    ? JSON.parse(process.env.ADMIN_CREDENTIALS)
    : [];

  for (const c of creds) {
    const normalizedUsername = c.username.trim().toLowerCase();
    const normalizedPhone = normalizePhone(c.phone);
    if (!normalizedPhone) continue;

    const phoneHash = hashValue(normalizedPhone);
    const existingByPhone = await prisma.user.findUnique({ where: { phoneHash } });
    const existingByUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } });

    if (existingByUsername && existingByUsername.id !== existingByPhone?.id) {
      // Conflicting user with the same username already exists — skip with a clear message.
      console.warn(
        `[skip] username ${normalizedUsername} already taken by another user (id=${existingByUsername.id}).`,
      );
      continue;
    }

    if (existingByPhone) {
      // Set username + password on the phone-based admin. Leave emailHash/emailCipher alone
      // so we don't clash with the existing USER account that owns the email.
      await prisma.user.update({
        where: { id: existingByPhone.id },
        data: {
          role: "ADMIN",
          isActive: c.isActive ?? true,
          username: normalizedUsername,
          passwordHash: hashPassword(c.password),
        },
      });
      console.log(`[ok] set username + password on phone-based admin (id=${existingByPhone.id})`);
      continue;
    }

    if (existingByUsername) {
      // Username exists but phone doesn't. Don't touch emailHash because of conflict risk.
      await prisma.user.update({
        where: { id: existingByUsername.id },
        data: {
          role: "ADMIN",
          isActive: c.isActive ?? true,
          passwordHash: hashPassword(c.password),
        },
      });
      console.log(`[ok] set password on existing username-based admin (id=${existingByUsername.id})`);
      continue;
    }

    console.warn(`[miss] neither phone (${normalizedPhone}) nor username (${normalizedUsername}) matched an existing user. Run scripts/seed-admin.mjs to create one.`);
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