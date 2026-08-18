"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaMobileAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAuth } from "@/components/auth/AuthProvider";

type Profile = {
  id: string;
  role: "USER" | "ADMIN";
  phone: string;
  fullName: string | null;
  email: string | null;
  username: string | null;
};

const BASE_INPUT_CLASS =
  "w-full rounded-sm border border-zinc-300 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10";
const LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-800";

function responseError(json: unknown, fallback: string) {
  const body = json as { error?: { detail?: string }; message?: string };
  return body?.error?.detail || body?.message || fallback;
}

export default function ProfileView({ initialProfile }: { initialProfile: Profile }) {
  const router = useRouter();
  const { refresh, signOut } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), phone: phone.trim() }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(responseError(json, "Unable to update your profile."));
      }
      const updated = json.data as { username: string; phone: string };
      setProfile((current) => ({ ...current, ...updated }));
      setUsername(updated.username);
      setPhone(updated.phone);
      setEditing(false);
      setMessage("Your profile has been updated.");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError("");
    const signedOut = await signOut();
    if (!signedOut) {
      setError("We could not sign you out. Please try again.");
      setSigningOut(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  const initials = (profile.username || profile.email || "U")
    .split(/[._\-\s]+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Go to home">
            <Image
              src="/Images/Logo/logo-dark.png"
              alt="Sri Veera Vinayaka"
              width={150}
              height={44}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link href="/" className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-[#e63946]">
            Back to website
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-7 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e63946] text-xl font-bold uppercase text-white">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e63946]">My account</p>
            <h1 className="truncate font-title text-2xl font-bold sm:text-3xl">
              {profile.username || "Your profile"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your personal account details.</p>
          </div>
        </section>

        <div aria-live="polite">
          {message ? <p className="mb-5 border-l-2 border-green-600 bg-green-50 p-3 text-xs text-green-800">{message}</p> : null}
          {error ? <p role="alert" className="mb-5 border-l-2 border-red-600 bg-red-50 p-3 text-xs text-red-800">{error}</p> : null}
        </div>

        <section className="rounded-sm border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-title text-lg font-bold">Profile details</h2>
              <p className="mt-1 text-xs text-zinc-500">Your email is verified and cannot be changed here.</p>
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={() => { setUsername(profile.username ?? ""); setPhone(profile.phone); setEditing(true); setMessage(""); setError(""); }}
                className="rounded-sm border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:border-[#e63946] hover:text-[#e63946]"
              >
                Edit
              </button>
            ) : null}
          </div>

          {!editing ? (
            <dl className="divide-y divide-zinc-100">
              <ProfileRow icon={<FaUser />} label="Username" value={profile.username || "Not set"} />
              <ProfileRow icon={<FaEnvelope />} label="Email address" value={profile.email || "Not set"} />
              <ProfileRow icon={<FaMobileAlt />} label="Mobile number" value={profile.phone || "Add a mobile number"} muted={!profile.phone} />
            </dl>
          ) : (
            <form onSubmit={saveProfile} className="space-y-5 p-5 sm:p-6">
              <div>
                <label htmlFor="profile-username" className={LABEL_CLASS}>Username</label>
                <input
                  id="profile-username"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9._-]+"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={BASE_INPUT_CLASS}
                  autoComplete="username"
                />
                <p className="mt-1.5 text-xs text-zinc-500">3–30 letters, numbers, dots, dashes, or underscores.</p>
              </div>
              <div>
                <label htmlFor="profile-phone" className={LABEL_CLASS}>Mobile number <span className="font-normal normal-case text-zinc-500">(optional)</span></label>
                <input
                  id="profile-phone"
                  type="tel"
                  maxLength={24}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={BASE_INPUT_CLASS}
                  placeholder="Add your mobile number"
                  autoComplete="tel"
                />
              </div>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button type="submit" disabled={loading} className="rounded-sm bg-[#e63946] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#c1121f] disabled:opacity-60">
                  {loading ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={() => { setEditing(false); setUsername(profile.username ?? ""); setPhone(profile.phone); setError(""); }} className="rounded-sm border border-zinc-300 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-700 hover:border-zinc-500">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8 border-t border-zinc-300 pt-6">
          <h2 className="font-title text-base font-bold">Sign out</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">End the session on this device.</p>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-4 inline-flex items-center gap-2 rounded-sm border border-[#e63946] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-[#e63946] hover:bg-[#e63946] hover:text-white disabled:opacity-60"
          >
            <FaSignOutAlt />
            {signingOut ? "Signing out…" : "Logout"}
          </button>
        </section>
      </div>
    </main>
  );
}

function ProfileRow({ icon, label, value, muted = false }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid gap-2 px-5 py-5 sm:grid-cols-[180px_1fr] sm:px-6">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
        <span className="text-[#e63946]">{icon}</span>{label}
      </dt>
      <dd className={`break-all text-sm ${muted ? "text-zinc-400" : "text-zinc-900"}`}>{value}</dd>
    </div>
  );
}
