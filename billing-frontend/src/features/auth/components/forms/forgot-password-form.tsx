"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    setSubmitted(true);
    toast.success("Password reset link sent to your email!");
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-400">
        If an account exists for that email, we&apos;ve sent instructions to reset your password.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300">
          Email address
        </label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="admin@invostar.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500"
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
