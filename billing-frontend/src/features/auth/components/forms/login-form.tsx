"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { mutate: login, isPending } = useLoginMutation(redirect);

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
      <div className="space-y-1.5">
        <Label htmlFor="username" className="text-neutral-300">
          Username / Email
        </Label>
        <Input
          id="username"
          type="text"
          {...register("username")}
          className="border-neutral-700 bg-neutral-950 text-white placeholder-slate-500 focus-visible:ring-indigo-500"
          placeholder="admin"
        />
        {errors.username && (
          <p className="text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-neutral-300">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>
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
