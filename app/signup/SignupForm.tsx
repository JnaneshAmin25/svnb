"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import TurnstileCaptcha from "@/components/security/TurnstileCaptcha";
import FormLegalLinks from "@/components/legal/FormLegalLinks";
import {
  FormSecondaryButton,
  FormSubmitButton,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_FORM_LABEL_CLASS,
} from "@/components/forms/PublicFormControls";

type Step = "email" | "otp" | "password" | "username";

function responseError(json: unknown, fallback: string) {
  const body = json as { error?: { detail?: string }; message?: string };
  return body?.error?.detail || body?.message || fallback;
}

export default function SignupForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: "signup",
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(responseError(json, "Unable to send the code."));
      }
      setStep("otp");
      setMessage("We sent a 6-digit verification code to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          purpose: "signup",
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(responseError(json, "Unable to verify the code."));
      }
      setStep("password");
      setMessage("Email verified. Now create a secure password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify the code.");
    } finally {
      setLoading(false);
    }
  }

  function continueToUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password.length > 128) {
      setError("Password must be 128 characters or fewer.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setStep("username");
    setMessage("Last step: choose your username.");
  }

  async function completeSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      const response = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, username: username.trim() }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(responseError(json, "Unable to create your account."));
      }

      await refresh();
      router.replace("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  const stepNumber = { email: 1, otp: 2, password: 3, username: 4 }[step];

  return (
    <div className="w-full">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e63946]">
        Step {stepNumber} of 4
      </p>
      <h1 className="mb-2 font-title text-2xl font-bold text-zinc-900 sm:text-3xl">
        Create your account
      </h1>
      <p className="mb-6 text-sm leading-6 text-zinc-600">
        {step === "email" && "Start with the email address you want to use."}
        {step === "otp" && "Verify that the email address belongs to you."}
        {step === "password" && "Use a strong, unique password for this account."}
        {step === "username" && "Choose the name you want shown on your profile."}
      </p>

      <div aria-live="polite">
        {message ? (
          <p className="mb-4 border-l-2 border-green-600 bg-green-50 p-3 text-xs leading-5 text-green-800">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mb-4 border-l-2 border-red-600 bg-red-50 p-3 text-xs leading-5 text-red-800">
            {error}
          </p>
        ) : null}
      </div>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className={PUBLIC_FORM_LABEL_CLASS}>Email address</label>
            <input
              id="signup-email"
              required
              type="email"
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={PUBLIC_FORM_INPUT_CLASS}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          <TurnstileCaptcha onTokenChange={setCaptchaToken} />
          <FormSubmitButton loading={loading} loadingText="Sending code…">Continue</FormSubmitButton>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <label htmlFor="signup-otp" className={PUBLIC_FORM_LABEL_CLASS}>Verification code</label>
            <input
              id="signup-otp"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              className={`${PUBLIC_FORM_INPUT_CLASS} tracking-[0.35em]`}
              placeholder="000000"
              autoFocus
            />
          </div>
          <p className="text-xs leading-5 text-zinc-500">
            Sent to <strong className="font-semibold text-zinc-800">{email}</strong>. The code expires shortly.
          </p>
          <FormSubmitButton loading={loading} loadingText="Verifying…">Verify email</FormSubmitButton>
          <FormSecondaryButton onClick={() => { setStep("email"); setOtp(""); clearFeedback(); }}>
            Change email or request a new code
          </FormSecondaryButton>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={continueToUsername} className="space-y-4">
          <div>
            <label htmlFor="signup-password" className={PUBLIC_FORM_LABEL_CLASS}>Password</label>
            <input
              id="signup-password"
              required
              type="password"
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={PUBLIC_FORM_INPUT_CLASS}
              autoComplete="new-password"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-zinc-500">Use at least 12 characters. A memorable passphrase works well.</p>
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className={PUBLIC_FORM_LABEL_CLASS}>Confirm password</label>
            <input
              id="signup-confirm-password"
              required
              type="password"
              minLength={12}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={PUBLIC_FORM_INPUT_CLASS}
              autoComplete="new-password"
            />
          </div>
          <FormSubmitButton>Continue</FormSubmitButton>
        </form>
      ) : null}

      {step === "username" ? (
        <form onSubmit={completeSignup} className="space-y-4">
          <div>
            <label htmlFor="signup-username" className={PUBLIC_FORM_LABEL_CLASS}>Username</label>
            <input
              id="signup-username"
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9._-]+"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={PUBLIC_FORM_INPUT_CLASS}
              placeholder="your.username"
              autoComplete="username"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-zinc-500">3–30 letters, numbers, dots, dashes, or underscores.</p>
          </div>
          <FormSubmitButton loading={loading} loadingText="Creating account…">Create account</FormSubmitButton>
          <FormSecondaryButton onClick={() => { setStep("password"); clearFeedback(); }}>
            Back to password
          </FormSecondaryButton>
        </form>
      ) : null}
      <div className="mt-6 border-t border-zinc-200 pt-5 text-center text-xs text-zinc-600">
        Already have an account?{" "}
        <Link
          replace
          href="/login"
          className="font-semibold text-[#e63946] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
      <FormLegalLinks className="mt-5" />
    </div>
  );
}
