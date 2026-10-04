import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Sign in to your InvoStar account
        </p>
      </div>

      <Suspense fallback={<div className="text-xs text-neutral-400">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
