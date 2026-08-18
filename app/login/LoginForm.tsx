"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import TurnstileCaptcha from "@/components/security/TurnstileCaptcha";
import FormLegalLinks from "@/components/legal/FormLegalLinks";
import {
  FormSubmitButton,
  PUBLIC_FORM_INPUT_CLASS,
  PUBLIC_FORM_LABEL_CLASS,
} from "@/components/forms/PublicFormControls";

function responseError(json: unknown, fallback: string) {
  const body = json as { error?: { detail?: string }; message?: string };
  return body?.error?.detail || body?.message || fallback;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, status } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/profile");
    }
  }, [router, status]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(responseError(json, "Unable to sign in."));
      }

      await refresh();
      const requested = searchParams.get("from");
      const destination = requested === "profile" ? "/profile" : "/profile";
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="mb-2 font-title text-2xl font-bold text-zinc-900 sm:text-3xl">Welcome back</h1>
      <p className="mb-6 text-sm leading-6 text-zinc-600">Sign in with the email and password used for your account.</p>

      {error ? (
        <p role="alert" aria-live="polite" className="mb-4 border-l-2 border-red-600 bg-red-50 p-3 text-xs leading-5 text-red-800">
          {error}
        </p>
      ) : null}

      <form onSubmit={login} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={PUBLIC_FORM_LABEL_CLASS}>Email address</label>
          <input
            id="login-email"
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
        <div>
          <label htmlFor="login-password" className={PUBLIC_FORM_LABEL_CLASS}>Password</label>
          <input
            id="login-password"
            required
            type="password"
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={PUBLIC_FORM_INPUT_CLASS}
            autoComplete="current-password"
          />
        </div>
        <TurnstileCaptcha onTokenChange={setCaptchaToken} />
        <FormSubmitButton
          loading={loading}
          loadingText="Signing in…"
          disabled={status === "authenticated"}
        >
          Sign in
        </FormSubmitButton>
      </form>

      <div className="mt-6 border-t border-zinc-200 pt-5 text-center text-xs text-zinc-600">
        New here?{" "}
        <Link replace href="/signup" className="font-semibold text-[#e63946] underline-offset-4 hover:underline">
          Create an account
        </Link>
      </div>
      <FormLegalLinks className="mt-5" />
    </div>
  );
}
