import AuthCard from "@/admin/components/AuthCard";
import LoginForm from "@/admin/components/LoginForm";

export const metadata = { title: "Sign in · SDC INDIA Admin" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Admin sign in"
      subtitle="Enter your admin email and password."
    >
      <LoginForm />
    </AuthCard>
  );
}
