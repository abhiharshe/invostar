import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
        <h2 className="mt-3 text-xl font-bold text-white">Reset password</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
