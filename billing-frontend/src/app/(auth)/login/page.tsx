import { LoginForm } from "@/features/auth/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to your InvoStar account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
