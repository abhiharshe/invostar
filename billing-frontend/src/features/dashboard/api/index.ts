import { api } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { DashboardMetrics, RecentActivity } from "../types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await api.get<ApiResponse<DashboardMetrics>>("/dashboard/metrics");
  return response.data.data;
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const response = await api.get<ApiResponse<RecentActivity[]>>("/dashboard/recent");
  return response.data.data;
}
