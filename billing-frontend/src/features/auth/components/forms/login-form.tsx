"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/features/auth/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300">
          Username / Email
        </label>
        <input
          type="text"
          {...register("username")}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="admin"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          {...register("password")}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
