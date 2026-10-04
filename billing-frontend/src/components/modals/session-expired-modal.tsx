"use client";

import { useAuthStore } from "@/stores/use-auth-store";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";

export function SessionExpiredModal() {
  const router = useRouter();
  const isOpen = useAuthStore((state) => state.isSessionExpiredModalOpen);
  const close = useAuthStore((state) => state.closeSessionExpiredModal);
  const expiredRedirectUrl = useAuthStore((state) => state.expiredRedirectUrl);

  const handleRedirectToLogin = () => {
    close();
    const query = expiredRedirectUrl
      ? `?redirect=${encodeURIComponent(expiredRedirectUrl)}`
      : "";
    router.push(`/login${query}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
            Session Expired
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
            Your security session has expired or is invalid. Please log in again to resume your work seamlessly.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 sm:justify-center">
          <Button
            type="button"
            onClick={handleRedirectToLogin}
            className="w-full bg-indigo-600 font-medium text-white hover:bg-indigo-500 sm:w-auto px-6"
          >
            Log In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
