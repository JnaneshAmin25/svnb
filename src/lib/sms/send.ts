import { env } from "@/lib/env";

export async function sendOtp(phone: string, code: string, template: string) {
  if (env.OTP_PROVIDER === "mock") {
    return true;
  }

  const message = template.replace("{{code}}", code);

  if (env.OTP_PROVIDER === "textlocal") {
    if (!env.TEXTLOCAL_API_KEY) {
      throw new Error("TEXTLOCAL_API_KEY is missing");
    }

    const body = new URLSearchParams({
      apikey: env.TEXTLOCAL_API_KEY,
      numbers: phone,
      message,
      sender: env.TEXTLOCAL_SENDER || "SVNB",
    });

    const response = await fetch("https://api.textlocal.in/send/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!response.ok) {
      throw new Error("OTP provider request failed");
    }
    const data = await response.json();
    if (!data || (data.status !== "success" && data.status !== "OK")) {
      throw new Error("OTP provider rejected send request");
    }
    return true;
  }

  throw new Error(`Unsupported OTP provider: ${env.OTP_PROVIDER}`);
}
