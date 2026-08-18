# Shri Veera Vinayaka Nasik Band — OP OA

## Backend + Frontend setup

1. Create local env file:

   ```bash
   cp .env.example .env.local
   ```

2. Fill credentials in `.env.local`.
3. Start dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Backend setup guide

- Use `ENV_SETUP.md` for step-by-step steps to obtain all keys.
- Database: Supabase PostgreSQL.
- OTP: TextLocal production (or `OTP_PROVIDER=mock` for local testing).
- Optional integrations: Cloudinary, Redis, Turnstile, Resend.
- Place real values only in `.env.local` (local) or platform secret env (prod).

## Useful run commands

- `npx prisma generate`
- `npx prisma migrate dev --schema prisma/schema.prisma`
- `npx prisma db seed --schema prisma/schema.prisma`

## Key API routes

Auth
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `PATCH /api/auth/profile`

Public + user
- `POST /api/bookings` (auth required)
- `GET /api/bookings` (auth required)
- `POST /api/reviews` (auth required)
- `GET /api/reviews`
- `POST /api/contact`
- `GET /api/gallery`

Admin
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
- `GET /api/admin/stream`
