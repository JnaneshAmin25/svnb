import AuthDrawer from "@/components/auth/AuthDrawer";
import SignupForm from "../../signup/SignupForm";

export default function SignupModal() {
  return (
    <AuthDrawer>
      <SignupForm />
    </AuthDrawer>
  );
}
