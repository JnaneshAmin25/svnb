import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  APP_BASE_URL: z.string().url().optional(),
  ADMIN_BASE_PATH: z.string().default("admin"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  DATABASE_URL: z.string().url("DATABASE_URL is required"),
  DATABASE_DIRECT_URL: z.string().url().optional(),
  SESSION_COOKIE_NAME: z.string().default("svnb_session"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be at least 16 chars"),
  ENCRYPTION_KEY: z.string().min(16, "ENCRYPTION_KEY must be set"),
  PII_HASH_SALT: z.string().min(16, "PII_HASH_SALT must be at least 16 chars"),
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
  OTP_PROVIDER: z
    .enum(["mock", "textlocal", "firebase"])
    .default("mock"),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  OTP_LENGTH: z.coerce.number().int().min(4).max(10).default(6),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  TEXTLOCAL_API_KEY: z.string().optional(),
  TEXTLOCAL_SENDER: z.string().optional(),
  TEXTLOCAL_COUNTRY_CODE: z.string().default("91"),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default("noreply@svnb.local"),
  ADMIN_PHONES: z.string().optional(),
  ADMIN_CREDENTIALS: z.string().optional(),
  DEFAULT_LIST_LIMIT: z.coerce.number().int().positive().default(20),
  MAX_LIST_LIMIT: z.coerce.number().int().positive().default(100),

  // Firebase (Phone Auth). Public web config — safe to ship to the client.
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Firebase Admin SDK — server only. Required to verify ID tokens when OTP_PROVIDER=firebase.
  FIREBASE_ADMIN_PROJECT_ID: z.string().optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().optional(),

  // Feature flag — when true, the /login page uses Firebase Phone Auth instead of server-issued OTP.
  FIREBASE_LOGIN_ENABLED: z
    .union([z.literal("true"), z.literal("false")])
    .default("false"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success && process.env.NODE_ENV !== "test") {
  throw new Error(
    parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; "),
  );
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof schema>);
