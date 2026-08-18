import AuthDrawer from "@/components/auth/AuthDrawer";
import LoginForm from "../../login/LoginForm";

export default function LoginModal() {
  return (
    <AuthDrawer>
      <LoginForm />
    </AuthDrawer>
  );
}
