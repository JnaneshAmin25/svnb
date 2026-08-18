"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiBell,
  FiCalendar,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchAdminJSON } from "@/lib/admin/fetch";

const NAVIGATION = [
  { suffix: "/dashboard", label: "Dashboard", icon: FiGrid },
  { suffix: "/bookings", label: "Bookings", icon: FiCalendar },
  { suffix: "/contacts", label: "Messages", icon: FiMessageSquare },
  { suffix: "/reviews", label: "Reviews", icon: FiStar },
  { suffix: "/users", label: "Users", icon: FiUsers },
  { suffix: "/gallery", label: "Gallery", icon: FiImage },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const firstSegment = pathname?.split("/").filter(Boolean)[0] ?? "admin";
  const adminBase = `/${firstSegment}`;
  const normalizedPathname = pathname?.replace(/\/$/, "") || "";
  const current = NAVIGATION.find((item) => normalizedPathname === `${adminBase}${item.suffix}`);

  useEffect(() => {
    let active = true;
    void fetchAdminJSON<{ role: "USER" | "ADMIN" }>("/api/auth/me").then((response) => {
      if (!active) return;
      setAuthorized(response.state === "success" && response.data?.role === "ADMIN");
      setReady(true);
    });
    return () => { active = false; };
  }, [pathname]);

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    const success = await signOut();
    if (success) {
      router.replace(adminBase);
      router.refresh();
      return;
    }
    setSigningOut(false);
  }

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f4f6fb] text-sm text-slate-500">Checking admin access…</div>;
  }

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6fb] p-6">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Image src="/Images/Logo/logo-dark.png" alt="Sri Veera Vinayaka" width={150} height={44} className="mx-auto h-11 w-auto" />
          <h1 className="mt-6 font-title text-2xl font-bold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with an administrator account to continue.</p>
          <button type="button" onClick={() => router.push(adminBase)} className="mt-6 w-full rounded-lg bg-[#e63946] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#c1121f]">Admin login</button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      {mobileOpen ? <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#14213d] text-white transition-transform duration-200 lg:w-[92px] lg:translate-x-0 xl:w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-5 lg:justify-center xl:justify-start">
          <Link href={`${adminBase}/dashboard`} className="flex items-center gap-3 overflow-hidden" onClick={() => setMobileOpen(false)}>
            <Image src="/Images/Logo/logo-light.png" alt="SVNB" width={142} height={42} className="h-10 w-auto lg:hidden xl:block" />
            <span className="hidden h-10 w-10 place-items-center rounded-lg bg-[#e63946] font-title text-xs font-bold lg:grid xl:hidden">SV</span>
          </Link>
          <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"><FiX /></button>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-2 px-3 py-5">
          {NAVIGATION.map((item) => {
            const href = `${adminBase}${item.suffix}`;
            const active = normalizedPathname === href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={href} onClick={() => setMobileOpen(false)} className={`flex h-12 items-center gap-3 rounded-lg px-4 text-sm font-medium transition lg:justify-center lg:px-0 xl:justify-start xl:px-4 ${active ? "bg-[#e63946] text-white shadow-lg shadow-red-950/20" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="lg:hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={logout} disabled={signingOut} className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white disabled:opacity-50 lg:justify-center lg:px-0 xl:justify-start xl:px-4">
            <FiLogOut className="h-5 w-5 shrink-0" />
            <span className="lg:hidden xl:inline">{signingOut ? "Signing out…" : "Logout"}</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[92px] xl:pl-64">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 p-2.5 text-slate-600 lg:hidden"><FiMenu /></button>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-900">{current?.label ?? "Admin"}</p>
              <p className="hidden text-xs text-slate-400 sm:block">Sri Veera Vinayaka administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Refresh page" onClick={() => router.refresh()} className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 hover:text-[#e63946]"><FiRefreshCw /></button>
            <button type="button" aria-label="Notifications" className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"><FiBell /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e63946]" /></button>
            <div className="ml-1 flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#14213d] text-xs font-bold text-white">{(user?.username || "A").slice(0, 2).toUpperCase()}</div>
              <div className="hidden sm:block"><p className="max-w-32 truncate text-xs font-semibold">{user?.username || "Administrator"}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Admin</p></div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
