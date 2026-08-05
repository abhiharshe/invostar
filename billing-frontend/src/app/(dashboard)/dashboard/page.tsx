"use client";

import { useDashboardMetrics, useRecentActivity } from "@/features/dashboard/hooks/use-dashboard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();

  // Fallback mock metrics if API backend is connecting
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalSales ?? 124500.5),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      title: "Sales Count",
      value: formatNumber(metrics?.salesCount ?? 328),
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400",
    },
    {
      title: "Total Purchases",
      value: formatCurrency(metrics?.totalPurchases ?? 48200.0),
      icon: ShoppingBag,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400",
    },
    {
      title: "Low Stock Items",
      value: formatNumber(metrics?.lowStockItemsCount ?? 5),
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Today is {formatDate(new Date())}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {metricsLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
