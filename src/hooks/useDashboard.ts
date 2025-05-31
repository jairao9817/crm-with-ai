import { useState, useEffect } from "react";
import { DashboardService } from "../services/dashboardService";
import type {
  DashboardMetrics,
  RecentActivity,
  PipelineData,
} from "../services/dashboardService";

interface UseDashboardReturn {
  metrics: DashboardMetrics | null;
  recentActivity: RecentActivity[];
  pipelineOverview: PipelineData | null;
  revenueTrends: Array<{ month: string; revenue: number }>;
  loading: {
    metrics: boolean;
    activity: boolean;
    pipeline: boolean;
    revenue: boolean;
  };
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pipelineOverview, setPipelineOverview] = useState<PipelineData | null>(
    null
  );
  const [revenueTrends, setRevenueTrends] = useState<
    Array<{ month: string; revenue: number }>
  >([]);

  const [loading, setLoading] = useState({
    metrics: true,
    activity: true,
    pipeline: true,
    revenue: true,
  });

  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch all dashboard data in parallel
      const [metricsData, activityData, pipelineData, revenueData] =
        await Promise.allSettled([
          DashboardService.getDashboardMetrics(),
          DashboardService.getRecentActivity(8),
          DashboardService.getPipelineOverview(),
          DashboardService.getRevenueTrends(),
        ]);

      // Handle metrics
      if (metricsData.status === "fulfilled") {
        setMetrics(metricsData.value);
      } else {
        console.error("Failed to fetch metrics:", metricsData.reason);
      }
      setLoading((prev) => ({ ...prev, metrics: false }));

      // Handle recent activity
      if (activityData.status === "fulfilled") {
        setRecentActivity(activityData.value);
      } else {
        console.error("Failed to fetch recent activity:", activityData.reason);
      }
      setLoading((prev) => ({ ...prev, activity: false }));

      // Handle pipeline overview
      if (pipelineData.status === "fulfilled") {
        setPipelineOverview(pipelineData.value);
      } else {
        console.error(
          "Failed to fetch pipeline overview:",
          pipelineData.reason
        );
      }
      setLoading((prev) => ({ ...prev, pipeline: false }));

      // Handle revenue trends
      if (revenueData.status === "fulfilled") {
        setRevenueTrends(revenueData.value);
      } else {
        console.error("Failed to fetch revenue trends:", revenueData.reason);
      }
      setLoading((prev) => ({ ...prev, revenue: false }));

      // Check if any critical data failed to load
      const failedRequests = [
        metricsData,
        activityData,
        pipelineData,
        revenueData,
      ].filter((result) => result.status === "rejected");

      if (failedRequests.length === 4) {
        setError("Failed to load dashboard data. Please try again.");
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading({
        metrics: false,
        activity: false,
        pipeline: false,
        revenue: false,
      });
    }
  };

  const refreshDashboard = async () => {
    setLoading({
      metrics: true,
      activity: true,
      pipeline: true,
      revenue: true,
    });
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    metrics,
    recentActivity,
    pipelineOverview,
    revenueTrends,
    loading,
    error,
    refreshDashboard,
  };
};
