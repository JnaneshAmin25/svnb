-- Separate account creation OTPs from legacy login challenges.
ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'SIGNUP';

-- Supports the newest active signup challenge lookup by email.
CREATE INDEX "OtpChallenge_channel_emailHash_purpose_createdAt_idx"
ON "OtpChallenge"("channel", "emailHash", "purpose", "createdAt");
