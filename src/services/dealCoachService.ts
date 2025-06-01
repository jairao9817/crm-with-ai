import { supabase } from "../lib/supabase";
import type {
  DealCoachSuggestion,
  CreateDealCoachSuggestionInput,
} from "../types";

export class DealCoachService {
  // Get all suggestions for a specific deal
  static async getSuggestionsByDeal(
    dealId: string
  ): Promise<DealCoachSuggestion[]> {
    const { data, error } = await supabase
      .from("deal_coach_suggestions")
      .select("*")
      .eq("deal_id", dealId)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch deal coach suggestions: ${error.message}`
      );
    }

    return data || [];
  }

  // Get the latest suggestion for a deal
  static async getLatestSuggestion(
    dealId: string
  ): Promise<DealCoachSuggestion | null> {
    const { data, error } = await supabase
      .from("deal_coach_suggestions")
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
      throw new Error(`Failed to fetch latest suggestion: ${error.message}`);
    }

    return data;
  }

  // Create a new suggestion
  static async createSuggestion(
    suggestionData: CreateDealCoachSuggestionInput
  ): Promise<DealCoachSuggestion> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deal_coach_suggestions")
      .insert({
        ...suggestionData,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create suggestion: ${error.message}`);
    }

    return data;
  }

  // Get a specific suggestion by ID
  static async getSuggestion(id: string): Promise<DealCoachSuggestion | null> {
    const { data, error } = await supabase
      .from("deal_coach_suggestions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch suggestion: ${error.message}`);
    }

    return data;
  }

  // Delete a suggestion
  static async deleteSuggestion(id: string): Promise<void> {
    const { error } = await supabase
      .from("deal_coach_suggestions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete suggestion: ${error.message}`);
    }
  }

  // Get all suggestions for the current user
  static async getUserSuggestions(): Promise<DealCoachSuggestion[]> {
    const { data, error } = await supabase
      .from("deal_coach_suggestions")
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
      throw new Error(`Failed to fetch user suggestions: ${error.message}`);
    }

    return data || [];
  }

  // Get suggestion statistics
  static async getSuggestionStats(): Promise<{
    totalSuggestions: number;
    thisMonthSuggestions: number;
    dealsWithSuggestions: number;
  }> {
    const { data, error } = await supabase
      .from("deal_coach_suggestions")
      .select("id, deal_id, generated_at");

    if (error) {
      throw new Error(`Failed to fetch suggestion stats: ${error.message}`);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalSuggestions = data?.length || 0;
    const thisMonthSuggestions =
      data?.filter(
        (suggestion) => new Date(suggestion.generated_at) >= thisMonth
      ).length || 0;

    const uniqueDeals = new Set(data?.map((s) => s.deal_id) || []);
    const dealsWithSuggestions = uniqueDeals.size;

    return {
      totalSuggestions,
      thisMonthSuggestions,
      dealsWithSuggestions,
    };
  }
}
