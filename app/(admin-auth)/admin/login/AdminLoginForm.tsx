"use client";

import { FormEvent, useState } from "react";

const BASE_INPUT_CLASS =
  "w-full border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 outline-none transition focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946]/30";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-900";

type AdminLoginFormProps = {
  redirectTo: string;
};

export default function AdminLoginForm({ redirectTo }: AdminLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!username || !password) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || "Admin login failed");
      setMessage("Admin login successful. Redirecting...");
      // Bounce through the public admin base path so middleware can rewrite
      // it to /admin — /admin itself is intentionally blocked at the edge.
      window.location.href = redirectTo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="admin-login-username" className={LABEL_CLASS}>
          Admin Username
        </label>
        <input
          id="admin-login-username"
          required
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={BASE_INPUT_CLASS}
          placeholder="admin"
        />
      </div>

      <div>
        <label htmlFor="admin-login-password" className={LABEL_CLASS}>
          Password
        </label>
        <input
          id="admin-login-password"
          required
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={BASE_INPUT_CLASS}
          placeholder="Password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#e63946] py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in to Admin"}
      </button>
    </form>
  );
}
