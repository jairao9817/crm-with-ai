import { ContactService } from "./contactService";
import { DealService } from "./dealService";
import { PurchaseHistoryService } from "./purchaseHistoryService";
import { TaskService } from "./taskService";
import { CommunicationService } from "./communicationService";
import { supabase } from "../lib/supabase";

export interface DashboardMetrics {
  totalContacts: number;
  activeDeals: number;
  thisMonthRevenue: number;
  conversionRate: number;
  totalRevenue: number;
  completedTasks: number;
  overdueTasks: number;
  totalCommunications: number;
  pipelineValue: number;
  wonDealsThisMonth: number;
  lostDealsThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: "contact" | "deal" | "task" | "communication" | "purchase";
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface PipelineData {
  lead: { count: number; value: number };
  prospect: { count: number; value: number };
  negotiation: { count: number; value: number };
  "closed-won": { count: number; value: number };
  "closed-lost": { count: number; value: number };
}

export class DashboardService {
  // Get comprehensive dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Fetch data from all services in parallel
      const [
        contacts,
        pipelineStats,
        revenueStats,
        taskStats,
        communicationStats,
      ] = await Promise.all([
        ContactService.getContacts(),
        DealService.getPipelineStats(),
        PurchaseHistoryService.getRevenueStats(),
        TaskService.getTaskStats(),
        CommunicationService.getCommunicationStats(),
      ]);

      // Calculate this month's won/lost deals
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data: monthlyDeals } = await supabase
        .from("deals")
        .select("stage, updated_at")
        .gte("updated_at", currentMonth.toISOString())
        .in("stage", ["closed-won", "closed-lost"]);

      const wonDealsThisMonth =
        monthlyDeals?.filter((d) => d.stage === "closed-won").length || 0;
      const lostDealsThisMonth =
        monthlyDeals?.filter((d) => d.stage === "closed-lost").length || 0;

      // Calculate conversion rate (closed-won / total deals)
      const totalClosedDeals =
        pipelineStats.stageStats["closed-won"].count +
        pipelineStats.stageStats["closed-lost"].count;
      const conversionRate =
        totalClosedDeals > 0
          ? (pipelineStats.stageStats["closed-won"].count / totalClosedDeals) *
            100
          : 0;

      // Calculate active deals (excluding closed deals)
      const activeDeals = pipelineStats.totalDeals - totalClosedDeals;

      // Calculate pipeline value (excluding closed deals)
      const pipelineValue =
        pipelineStats.stageStats.lead.value +
        pipelineStats.stageStats.prospect.value +
        pipelineStats.stageStats.negotiation.value;

      return {
        totalContacts: contacts.length,
        activeDeals,
        thisMonthRevenue: revenueStats.thisMonthRevenue,
        conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
        totalRevenue: revenueStats.totalRevenue,
        completedTasks: taskStats.completedTasks,
        overdueTasks: taskStats.overdueTasks,
        totalCommunications: communicationStats.total,
        pipelineValue,
        wonDealsThisMonth,
        lostDealsThisMonth,
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw new Error("Failed to fetch dashboard metrics");
    }
  }

  // Get pipeline overview for visualization
  static async getPipelineOverview(): Promise<PipelineData> {
    try {
      const pipelineStats = await DealService.getPipelineStats();
      return pipelineStats.stageStats;
    } catch (error) {
      console.error("Error fetching pipeline overview:", error);
      throw new Error("Failed to fetch pipeline overview");
    }
  }

  // Get recent activity across all modules
  static async getRecentActivity(
    limit: number = 10
  ): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent contacts (last 5)
      const recentContacts = await ContactService.getContacts();
      recentContacts.slice(0, 3).forEach((contact) => {
        activities.push({
          id: contact.id,
          type: "contact",
          title: `New contact: ${contact.name}`,
          description: `Added ${
            contact.company ? `from ${contact.company}` : contact.email
          }`,
          date: contact.created_at,
          icon: "UserIcon",
        });
      });

      // Get recent deals (last 5)
      const recentDeals = await DealService.getDeals();
      recentDeals.slice(0, 3).forEach((deal) => {
        activities.push({
          id: deal.id,
          type: "deal",
          title: `Deal updated: ${deal.title}`,
          description: `Stage: ${deal.stage.replace("-", " ")}${
            deal.monetary_value
              ? ` • $${deal.monetary_value.toLocaleString()}`
              : ""
          }`,
          date: deal.updated_at,
          icon: "BriefcaseIcon",
        });
      });

      // Get recent tasks (last 3)
      const recentTasks = await TaskService.getTasks();
      recentTasks.slice(0, 2).forEach((task) => {
        activities.push({
          id: task.id,
          type: "task",
          title: `Task: ${task.title}`,
          description: `Status: ${task.status}${
            task.due_date
              ? ` • Due: ${new Date(task.due_date).toLocaleDateString()}`
              : ""
          }`,
          date: task.updated_at || task.created_at,
          icon: "CheckCircleIcon",
        });
      });

      // Get recent communications (last 2)
      const recentCommunications =
        await CommunicationService.getCommunications();
      recentCommunications.slice(0, 2).forEach((comm) => {
        activities.push({
          id: comm.id,
          type: "communication",
          title: `${comm.type.replace("_", " ")}: ${comm.subject}`,
          description: `With ${comm.contact?.name || "Unknown contact"}`,
          date: comm.communication_date,
          icon: "ChatBubbleLeftIcon",
        });
      });

      // Sort by date (most recent first) and limit
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw new Error("Failed to fetch recent activity");
    }
  }

  // Get revenue trends for the last 6 months
  static async getRevenueTrends(): Promise<
    Array<{ month: string; revenue: number }>
  > {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from("purchase_history")
        .select("date, amount, status")
        .gte("date", sixMonthsAgo.toISOString())
        .eq("status", "completed")
        .order("date", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch revenue trends: ${error.message}`);
      }

      // Group by month
      const monthlyRevenue: Record<string, number> = {};

      data?.forEach((purchase) => {
        const date = new Date(purchase.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyRevenue[monthKey] =
          (monthlyRevenue[monthKey] || 0) + purchase.amount;
      });

      // Generate last 6 months array
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const monthName = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        trends.push({
          month: monthName,
          revenue: monthlyRevenue[monthKey] || 0,
        });
      }

      return trends;
    } catch (error) {
      console.error("Error fetching revenue trends:", error);
      throw new Error("Failed to fetch revenue trends");
    }
  }
}
