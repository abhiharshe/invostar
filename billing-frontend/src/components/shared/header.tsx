"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Bell, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUIStore } from "@/stores/use-ui-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Only render the theme icon after hydration to avoid SSR/client mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="flex md:hidden items-center justify-center p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          InvoStar Billing System
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Toggle Theme"
        >
          {/* Render nothing until mounted to avoid SSR/hydration mismatch */}
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 border-l border-border pl-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-foreground">
              {user?.name ?? "Admin User"}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">
              {user?.role?.toLowerCase() ?? "Administrator"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
