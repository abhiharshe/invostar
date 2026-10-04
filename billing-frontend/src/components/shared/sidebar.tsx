"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  CreditCard,
  Wallet,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Purchases", href: "/purchases", icon: Receipt },
  { label: "Sales", href: "/sales", icon: ShoppingCart },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Expenses", href: "/expenses", icon: Wallet },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              InvoStar
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex h-7 w-7 items-center justify-center border border-sidebar-border bg-sidebar text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/40"
                )}
              />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
