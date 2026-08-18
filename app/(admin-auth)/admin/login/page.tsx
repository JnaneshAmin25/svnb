import AdminLoginForm from "./AdminLoginForm";
import AuthDrawer from "@/components/auth/AuthDrawer";
import SiteAuthBackdrop from "@/components/auth/SiteAuthBackdrop";
import { env } from "@/lib/env";

export const metadata = { title: "Admin Sign in — SVNB" };

// Public path the user hits. Middleware rewrites this to /admin (the actual
// route segment), so we redirect there post-login instead of /admin (which
// is intentionally blocked at the edge).
const publicAdminPath = `/${env.ADMIN_BASE_PATH.trim().replace(/^\/+|\/+$/g, "")}`;
const postLoginRedirect = `${publicAdminPath}/dashboard`;

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen">
      <SiteAuthBackdrop />
      <AuthDrawer admin closeToHome>
        <div className="w-full">
          <h1 className="mb-2 font-title text-2xl font-bold text-zinc-900 sm:text-3xl">
            Admin Sign in
          </h1>
          <p className="mb-7 text-sm leading-6 text-zinc-600">
            Enter your admin credentials to access the dashboard.
          </p>

          <AdminLoginForm redirectTo={postLoginRedirect} />

          <p className="mt-8 border-t border-zinc-200 pt-5 text-[11px] leading-5 text-zinc-500">
            Restricted to authorized staff. Sign-in attempts are logged and
            rate-limited.
          </p>
        </div>
      </AuthDrawer>
    </main>
  );
}
