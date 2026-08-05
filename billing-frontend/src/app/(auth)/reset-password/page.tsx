import { ResetPasswordForm } from "@/features/auth/components/forms/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Set new password</h2>
        <p className="mt-1 text-sm text-slate-400">
          Your new password must be different from previous passwords.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
