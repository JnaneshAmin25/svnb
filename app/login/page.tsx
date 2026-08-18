import AuthDrawer from "@/components/auth/AuthDrawer";
import SiteAuthBackdrop from "@/components/auth/SiteAuthBackdrop";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login — SVNB" };

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <SiteAuthBackdrop />
      <AuthDrawer closeToHome>
        <LoginForm />
      </AuthDrawer>
    </main>
  );
}
