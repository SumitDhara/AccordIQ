import apiClient from "@/lib/api/client";

import type {
  DashboardStats,
  RecentDocument,
} from "@/types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class DashboardService {
  async getStatistics(): Promise<DashboardStats> {
    const response = await apiClient.get<
      ApiResponse<DashboardStats>
    >("/dashboard/stats");

    return response.data.data;
  }

  async getRecentDocuments(): Promise<RecentDocument[]> {
    const response = await apiClient.get<
      ApiResponse<RecentDocument[]>
    >("/dashboard/recent");

    return response.data.data;
  }
}

export default new DashboardService();