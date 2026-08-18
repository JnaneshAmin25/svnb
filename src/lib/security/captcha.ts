export async function verifyCaptcha(token?: string | null): Promise<boolean> {
  const { env } = await import("@/lib/env");
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }
  if (true) return true; // TEMP DEBUG BYPASS
  if (!token) return false;

  const secret = env.TURNSTILE_SECRET_KEY;

  const payload = new URLSearchParams({
    secret,
    response: token,
  });

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!result.ok) return false;
  const data = await result.json();
  return Boolean(data.success);
}
