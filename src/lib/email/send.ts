import { Resend } from "resend";
import { env } from "@/lib/env";

let resend: Resend | null = null;

function getClient() {
  if (!env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

export async function sendEmail(subject: string, to: string, html: string) {
  const client = getClient();
  if (!client) {
    console.error("[email] RESEND_API_KEY is not configured");
    return false;
  }

  try {
    const result = await client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    if (result.error) {
      console.error("[email] Resend rejected the message", {
        name: result.error.name,
        message: result.error.message,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[email] Resend request failed",
      error instanceof Error ? error.message : "Unknown email error",
    );
    return false;
  }
}

export async function notifyAdmin(subject: string, html: string, to: string) {
  if (!to) return false;
  return sendEmail(subject, to, html);
}

export function escapeEmailText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendTransactionalEmail(to: string, subject: string, lines: string[]) {
  if (!to) return false;
  const body = lines.map((line) => `<p>${escapeEmailText(line)}</p>`).join("");
  return sendEmail(subject, to, body);
}

export async function sendOtpEmail(
  email: string,
  code: string,
  purpose: "login" | "signup" = "login",
) {
  const safeCode = escapeEmailText(code);
  const action = purpose === "signup" ? "verify your email" : "sign in";
  const subject = purpose === "signup" ? "Verify your SVNB email" : "Your SVNB login code";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #18181b; font-size: 20px; margin: 0 0 16px;">Your login code</h2>
      <p style="color: #52525b; font-size: 14px; line-height: 1.5; margin: 0 0 24px;">
        Use the code below to ${action} for Shri Veera Vinayaka Nasik Band. It expires shortly.
      </p>
      <div style="background: #fafafa; border: 1px solid #e4e4e7; padding: 20px; text-align: center; margin: 0 0 24px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b; font-family: 'Courier New', monospace;">${safeCode}</span>
      </div>
      <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
  return sendEmail(subject, email, html);
}
