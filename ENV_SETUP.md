# Environment setup (where to place credentials)

All runtime secrets must be placed in `.env.local`.

```bash
cp .env.example .env.local
```

After editing `.env.local`, restart:

```bash
npm run dev
```

## Where to place credentials

- Local development: `.env.local` at repo root.
- Production/staging: platform secret store (Vercel, Netlify, Render, Docker env, etc.).
- Never commit `.env.local`.
- `.env.example` can stay in git as a template.

## Required keys (must exist for startup)

- `DATABASE_URL` (Supabase pooled connection, Prisma runtime)
- `SESSION_SECRET` (>=16 chars)
- `ENCRYPTION_KEY` (>=16 chars)
- `PII_HASH_SALT` (>=16 chars)
- `OTP_PROVIDER` (`mock` or `textlocal`)
- `NEXT_PUBLIC_SITE_URL` (used for contact redirect links and emails)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` can stay empty only if you intentionally skip captcha.

## Optional keys (needed for specific features)

- `DATABASE_DIRECT_URL` (Prisma migrate/seed workflows)
- `SESSION_COOKIE_NAME`
- `SESSION_TTL_SECONDS`
- `OTP_TTL_SECONDS`
- `OTP_LENGTH`
- `OTP_MAX_ATTEMPTS`
- `TEXTLOCAL_API_KEY`
- `TEXTLOCAL_SENDER`
- `TEXTLOCAL_COUNTRY_CODE`
- `REDIS_URL`
- `REDIS_TOKEN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_PHONES`
- `APP_BASE_URL`
- `DEFAULT_LIST_LIMIT`
- `MAX_LIST_LIMIT`

## How to obtain all keys

### Supabase (PostgreSQL)

1. Create/Select your project.
2. Go to **Settings → Database**.
3. Copy:
   - Pooler URL -> `DATABASE_URL`
   - Direct URL -> `DATABASE_DIRECT_URL`

Note: if your Supabase dashboard shows `postgresql://...`, that is still valid when pasted.

### Session / security secrets

```bash
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 48
```

Use these for:
- `SESSION_SECRET`
- `ENCRYPTION_KEY`
- `PII_HASH_SALT`

### Cloudflare Turnstile

1. Create site in [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Add site keys:
   - Site Key -> `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - Secret Key -> `TURNSTILE_SECRET_KEY`

### OTP (TextLocal)

1. Local/dev test without SMS: `OTP_PROVIDER=mock`.
2. Production SMS: create account at [TextLocal](https://www.textlocal.in/).
3. Add:
   - `TEXTLOCAL_API_KEY`
   - `TEXTLOCAL_SENDER` (optional)
   - `TEXTLOCAL_COUNTRY_CODE` (optional, default `91`)

### Redis (rate limit + cache + SSE)

1. Create a Redis instance in [Upstash](https://upstash.com/) or self-hosted).
2. Copy endpoint/token to:
   - `REDIS_URL`
   - `REDIS_TOKEN`

### Cloudinary (gallery media)

1. Open [Cloudinary](https://cloudinary.com/) dashboard.
2. Copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Cloudinary works as the single source for all gallery images/videos. Admin upload/delete actions update records using stored `cloudinaryPublicId` so gallery stays in sync automatically.

### Email (review responses / notifications)

1. Create account at [Resend](https://resend.com/).
2. Verify sender/domain.
3. Copy:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`

## Credential handoff format

Send me this whenever you are ready:

```text
DATABASE_URL=...
DATABASE_DIRECT_URL=...
SESSION_SECRET=...
ENCRYPTION_KEY=...
PII_HASH_SALT=...
OTP_PROVIDER=mock|textlocal
TEXTLOCAL_API_KEY=...
TEXTLOCAL_SENDER=...
TEXTLOCAL_COUNTRY_CODE=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
REDIS_URL=...
REDIS_TOKEN=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
  RESEND_API_KEY=...
  EMAIL_FROM=...
  ADMIN_PHONES=...
  DEFAULT_LIST_LIMIT=20
  MAX_LIST_LIMIT=100
```

If a key is not ready yet, send `-` or keep blank for optional fields.

## Current backend routes in this implementation

- Auth
  - `POST /api/auth/request-otp`
  - `POST /api/auth/verify-otp`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
  - `PATCH /api/auth/profile`
- Public + user
  - `POST /api/bookings` (auth required)
  - `GET /api/bookings` (auth required)
  - `POST /api/reviews` (auth required)
  - `GET /api/reviews`
  - `POST /api/contact`
  - `GET /api/gallery`
- Admin (auth required + admin role)
  - `GET /api/admin/events`
  - `GET /api/admin/bookings`
  - `POST /api/admin/bookings`
  - `PATCH /api/admin/bookings/:id`
  - `GET /api/admin/contacts`
  - `PATCH /api/admin/contacts`
  - `GET /api/admin/reviews`
  - `PATCH /api/admin/reviews`
  - `GET /api/admin/team`
  - `POST /api/admin/team`
  - `PATCH /api/admin/team/:id`
  - `GET /api/admin/gallery`
  - `POST /api/admin/gallery`
  - `PATCH /api/admin/gallery/:id`
  - `DELETE /api/admin/gallery/:id`
  - `GET /api/admin/users`
  - `GET /api/admin/stream` (SSE)
