import { supabase } from "../lib/supabase";
import type {
  WinLossExplainerResponse,
  CreateWinLossAnalysisInput,
} from "../types";

export class WinLossAnalysisService {
  // Get all analyses for a specific deal
  static async getAnalysesByDeal(
    dealId: string
  ): Promise<WinLossExplainerResponse[]> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .eq("deal_id", dealId)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch win-loss analyses: ${error.message}`);
    }

    return data || [];
  }

  // Get the latest analysis for a deal
  static async getLatestAnalysis(
    dealId: string
  ): Promise<WinLossExplainerResponse | null> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .eq("deal_id", dealId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch latest analysis: ${error.message}`);
    }

    return data;
  }

  // Get analyses by outcome (won/lost)
  static async getAnalysesByOutcome(
    outcome: "won" | "lost"
  ): Promise<WinLossExplainerResponse[]> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .eq("outcome", outcome)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analyses by outcome: ${error.message}`);
    }

    return data || [];
  }

  // Create a new analysis
  static async createAnalysis(
    analysisData: CreateWinLossAnalysisInput
  ): Promise<WinLossExplainerResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("win_loss_analyses")
      .insert({
        ...analysisData,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }

    return data;
  }

  // Get a specific analysis by ID
  static async getAnalysis(
    id: string
  ): Promise<WinLossExplainerResponse | null> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch analysis: ${error.message}`);
    }

    return data;
  }

  // Delete an analysis
  static async deleteAnalysis(id: string): Promise<void> {
    const { error } = await supabase
      .from("win_loss_analyses")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }
  }

  // Get all analyses for the current user
  static async getUserAnalyses(): Promise<WinLossExplainerResponse[]> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select(
        `
        *,
        deal:deals(
          id,
          title,
          stage,
          monetary_value,
          probability_percentage
        )
      `
      )
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user analyses: ${error.message}`);
    }

    return data || [];
  }

  // Get analysis statistics
  static async getAnalysisStats(): Promise<{
    totalAnalyses: number;
    thisMonthAnalyses: number;
    wonAnalyses: number;
    lostAnalyses: number;
    averageConfidenceScore: number;
    dealsWithAnalyses: number;
    topLossReasons: Array<{ reason: string; count: number }>;
    topWinFactors: Array<{ factor: string; count: number }>;
  }> {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select(
        "id, deal_id, outcome, confidence_score, key_factors, generated_at"
      );

    if (error) {
      throw new Error(`Failed to fetch analysis stats: ${error.message}`);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAnalyses = data?.length || 0;
    const thisMonthAnalyses =
      data?.filter((analysis) => new Date(analysis.generated_at) >= thisMonth)
        .length || 0;

    const wonAnalyses = data?.filter((a) => a.outcome === "won").length || 0;
    const lostAnalyses = data?.filter((a) => a.outcome === "lost").length || 0;

    const averageConfidenceScore =
      data?.reduce((sum, a) => sum + a.confidence_score, 0) / totalAnalyses ||
      0;

    const uniqueDeals = new Set(data?.map((a) => a.deal_id) || []);
    const dealsWithAnalyses = uniqueDeals.size;

    // Count top loss reasons and win factors
    const lossReasons: Record<string, number> = {};
    const winFactors: Record<string, number> = {};

    data?.forEach((analysis) => {
      analysis.key_factors.forEach((factor: string) => {
        const lowerFactor = factor.toLowerCase().trim();
        if (analysis.outcome === "lost") {
          lossReasons[lowerFactor] = (lossReasons[lowerFactor] || 0) + 1;
        } else {
          winFactors[lowerFactor] = (winFactors[lowerFactor] || 0) + 1;
        }
      });
    });

    const topLossReasons = Object.entries(lossReasons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([reason, count]) => ({ reason, count }));

    const topWinFactors = Object.entries(winFactors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([factor, count]) => ({ factor, count }));

    return {
      totalAnalyses,
      thisMonthAnalyses,
      wonAnalyses,
      lostAnalyses,
      averageConfidenceScore: Math.round(averageConfidenceScore * 100) / 100,
      dealsWithAnalyses,
      topLossReasons,
      topWinFactors,
    };
  }

  // Get high confidence analyses (confidence score >= 80)
  static async getHighConfidenceAnalyses(): Promise<
    WinLossExplainerResponse[]
  > {
    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .gte("confidence_score", 80)
      .order("confidence_score", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch high confidence analyses: ${error.message}`
      );
    }

    return data || [];
  }

  // Get recent analyses (last 30 days)
  static async getRecentAnalyses(): Promise<WinLossExplainerResponse[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("win_loss_analyses")
      .select("*")
      .gte("generated_at", thirtyDaysAgo.toISOString())
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recent analyses: ${error.message}`);
    }

    return data || [];
  }
}
