import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";
import { z } from "zod";
import { hashValue } from "@/lib/utils/hash";
import { encryptText } from "@/lib/security/crypto";
import { normalizePhone } from "@/lib/utils/hash";
import { hashPassword } from "@/lib/auth/credentials";

const prisma = new PrismaClient();

const adminCredentialSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().min(8),
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

type AdminCredential = z.infer<typeof adminCredentialSchema>;

function parseAdminCredentials(): AdminCredential[] {
  if (!env.ADMIN_CREDENTIALS) return [];
  const parsed = JSON.parse(env.ADMIN_CREDENTIALS);
  return z.array(adminCredentialSchema).parse(parsed);
}

async function main() {
  const defaultAdminPhones = (env.ADMIN_PHONES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const phone of defaultAdminPhones) {
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
      update: {
        role: "ADMIN",
      },
    });
  }

  const adminCredentials = parseAdminCredentials();
  for (const credential of adminCredentials) {
    const normalizedUsername = credential.username.trim().toLowerCase();
    const normalizedPhone = normalizePhone(credential.phone);
    if (!normalizedPhone) continue;

    const phoneHash = hashValue(normalizedPhone);
    const fullNameCipher = credential.fullName ? encryptText(credential.fullName) : null;
    const emailCipher = credential.email ? encryptText(credential.email) : null;

    const byUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (byUsername) {
      await prisma.user.update({
        where: { id: byUsername.id },
        data: {
          role: "ADMIN",
          isActive: credential.isActive ?? true,
          phoneHash,
          phoneCipher: encryptText(normalizedPhone) || "",
          passwordHash: hashPassword(credential.password),
          username: normalizedUsername,
          fullNameCipher: fullNameCipher ?? byUsername.fullNameCipher,
          fullNameHash: credential.fullName ? hashValue(credential.fullName) : byUsername.fullNameHash,
          emailCipher: emailCipher ?? byUsername.emailCipher,
          emailHash: credential.email ? hashValue(credential.email) : byUsername.emailHash,
        },
      });
      continue;
    }

    const byPhone = await prisma.user.findUnique({ where: { phoneHash } });
    if (byPhone) {
      await prisma.user.update({
        where: { id: byPhone.id },
        data: {
          role: "ADMIN",
          isActive: credential.isActive ?? true,
          username: normalizedUsername,
          passwordHash: hashPassword(credential.password),
          fullNameCipher: fullNameCipher ?? byPhone.fullNameCipher,
          fullNameHash: credential.fullName ? hashValue(credential.fullName) : byPhone.fullNameHash,
          emailCipher: emailCipher ?? byPhone.emailCipher,
          emailHash: credential.email ? hashValue(credential.email) : byPhone.emailHash,
        },
      });
      continue;
    }

    await prisma.user.create({
      data: {
        phoneHash,
        phoneCipher: encryptText(normalizedPhone) || "",
        role: "ADMIN",
        isActive: credential.isActive ?? true,
        username: normalizedUsername,
        passwordHash: hashPassword(credential.password),
        fullNameCipher: fullNameCipher,
        fullNameHash: credential.fullName ? hashValue(credential.fullName) : null,
        emailCipher: emailCipher,
        emailHash: credential.email ? hashValue(credential.email) : null,
      },
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
