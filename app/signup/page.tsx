import AuthDrawer from "@/components/auth/AuthDrawer";
import SiteAuthBackdrop from "@/components/auth/SiteAuthBackdrop";
import SignupForm from "./SignupForm";

export const metadata = { title: "Sign Up — SVNB" };

export default function SignupPage() {
  return (
    <main className="min-h-screen">
      <SiteAuthBackdrop />
      <AuthDrawer closeToHome>
        <SignupForm />
      </AuthDrawer>
    </main>
  );
}
