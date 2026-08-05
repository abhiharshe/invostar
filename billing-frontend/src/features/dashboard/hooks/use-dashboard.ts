import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, getRecentActivity } from "../api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  recent: () => [...dashboardKeys.all, "recent"] as const,
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: getDashboardMetrics,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.recent(),
    queryFn: getRecentActivity,
  });
}
