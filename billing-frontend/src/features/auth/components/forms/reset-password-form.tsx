"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    toast.success("Password reset successfully! Please log in.");
    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-neutral-300">
          New password
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className="border-neutral-700 bg-neutral-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-neutral-300">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className="border-neutral-700 bg-neutral-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500"
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500"
      >
        {isSubmitting ? "Updating..." : "Reset password"}
      </Button>
    </form>
  );
}
