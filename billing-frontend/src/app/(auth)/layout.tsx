import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            InvoStar
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-10 dark:bg-slate-900">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} InvoStar Billing. All rights reserved.
      </div>
    </div>
  );
}
