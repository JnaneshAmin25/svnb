# `.env` Keys and Setup Steps (Single Reference)

Use this file with your local secrets file:

```bash
cp .env.example .env.local
```

Fill `.env.local` with real values only.

## A) Required keys (must be present for app startup)

- `DATABASE_URL`
  - What it is: Supabase pooled PostgreSQL URL used by runtime.
  - How to get:
    1. Open [Supabase](https://supabase.com/) project.
    2. Go to **Settings → Database → Connection string**.
    3. Copy the **URI / Pooler** value.
  - Example:
    - `postgres://...@db.<project-ref>.supabase.co:5432/postgres`

- `SESSION_SECRET`
  - What it is: HMAC/session signing key.
  - How to generate:
    ```bash
    openssl rand -base64 32
    ```
  - Put the generated value as-is.

- `ENCRYPTION_KEY`
  - What it is: AES-256 encryption key for encrypted DB fields.
  - How to generate:
    ```bash
    openssl rand -base64 32
    ```

- `PII_HASH_SALT`
  - What it is: salt for deterministic hashing of PII lookups.
  - How to generate:
    ```bash
    openssl rand -base64 48
    ```

- `OTP_PROVIDER`
  - Allowed values: `mock` or `textlocal`.
  - Recommended for local: `mock`.
  - For production SMS: `textlocal`.

## B) Recommended operational keys (recommended for production)

- `DATABASE_DIRECT_URL`
  - What it is: Supabase direct DB URL for Prisma migrations/seed.
  - Where from: same Supabase page, **Direct connection** string.

- `SESSION_COOKIE_NAME`
  - Default: `svnb_session` (pre-filled in `.env.example`).
  - Keep unless you have a naming policy.

- `SESSION_TTL_SECONDS`
  - Default: `86400` (1 day). Set in minutes/hours as needed.

- `OTP_TTL_SECONDS`
  - What it does: OTP expiry in seconds (default `300`).

- `OTP_LENGTH`
  - OTP digits length (default `6`).

- `OTP_MAX_ATTEMPTS`
  - Max verify attempts per OTP request (default `5`).

- `TEXTLOCAL_API_KEY`
  - Use when `OTP_PROVIDER=textlocal`.
  - Get from [TextLocal API settings](https://www.textlocal.in/).

- `TEXTLOCAL_SENDER`
  - Sender ID from TextLocal (default can be `SVNB` or your approved sender).

- `TEXTLOCAL_COUNTRY_CODE`
  - Country code (default `91` for India).

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - Public site key for bot protection.
  - Get from [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).

- `TURNSTILE_SECRET_KEY`
  - Private secret key from Cloudflare Turnstile.

- `REDIS_URL`
  - Redis endpoint for rate limiting, cache invalidation, SSE state.
  - Recommended provider: Upstash.

- `REDIS_TOKEN`
  - Redis access token/password (provider-specific).

- `CLOUDINARY_CLOUD_NAME`
  - Cloudinary cloud name.

- `CLOUDINARY_API_KEY`
  - Cloudinary API key.

- `CLOUDINARY_API_SECRET`
  - Cloudinary API secret.
  - Steps:
    1. Open [Cloudinary Console](https://cloudinary.com/).
    2. Copy values from dashboard API keys.

- `RESEND_API_KEY`
  - Email API key for transactional mail (review/contact updates).
  - From [Resend](https://resend.com/).

- `EMAIL_FROM`
  - Verified sender email/domain used in outbound emails.

- `ADMIN_PHONES`
  - Comma-separated admin phone numbers with country code.
  - Example: `+919812345678,+918112233445`
  - These numbers auto-promote to ADMIN role on login if present.

- `APP_BASE_URL`
  - Used for callback/admin redirect behavior if needed.
  - Set to your site origin.

- `NEXT_PUBLIC_SITE_URL`
  - Frontend + API origin.
  - Example: `http://localhost:3000` locally, production URL in deploy.

- `NEXT_PUBLIC_APP_NAME`
  - App display name (optional cosmetic setting).

- `DEFAULT_LIST_LIMIT`
  - API default list page size (default `20`).

- `MAX_LIST_LIMIT`
  - API max allowed list size (default `100`).

## C) Optional but useful keys for local development only

- Keep these empty only if you intentionally skip that feature:
  - `REDIS_*` to run without Redis cache/rate-limit backend.
  - `CLOUDINARY_*` to disable admin gallery upload/delete actions to cloud storage.
  - `RESEND_API_KEY`/`EMAIL_FROM` to disable transactional emails.
  - `NEXT_PUBLIC_TURNSTILE_*` + `TURNSTILE_SECRET_KEY` to disable captcha checks.

## D) Exact key insertion order for `.env.local`

Paste in this exact order (one per line):

```text
DATABASE_URL=...
DATABASE_DIRECT_URL=...
SESSION_COOKIE_NAME=...
SESSION_TTL_SECONDS=...
SESSION_SECRET=...
ENCRYPTION_KEY=...
PII_HASH_SALT=...
REDIS_URL=...
REDIS_TOKEN=...
OTP_PROVIDER=...
OTP_TTL_SECONDS=...
OTP_LENGTH=...
OTP_MAX_ATTEMPTS=...
TEXTLOCAL_API_KEY=...
TEXTLOCAL_SENDER=...
TEXTLOCAL_COUNTRY_CODE=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=...
ADMIN_PHONES=...
APP_BASE_URL=...
NEXT_PUBLIC_SITE_URL=...
NEXT_PUBLIC_APP_NAME=...
DEFAULT_LIST_LIMIT=...
MAX_LIST_LIMIT=...
```

Use `...` only for required values you are ready to provide. Leave optional entries blank only if you are intentionally disabling that integration.

## E) One final checklist before running

- `[x]` `.env.local` exists at repo root.
- `[x]` `DATABASE_URL` is set.
- `[x]` `SESSION_SECRET`, `ENCRYPTION_KEY`, `PII_HASH_SALT` are long random strings.
- `[x]` `OTP_PROVIDER=mock` for local, `textlocal` for production SMS.
- `[x]` Restart:

```bash
npm run dev
```
