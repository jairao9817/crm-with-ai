import { supabase } from "../lib/supabase";
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealFilters,
  DealStage,
} from "../types";

export class DealService {
  // Get all deals for the current user with contact information
  static async getDeals(filters?: DealFilters): Promise<Deal[]> {
    let query = supabase
      .from("deals")
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .order("created_at", { ascending: false });

    // Apply stage filter
    if (filters?.stage) {
      query = query.eq("stage", filters.stage);
    }

    // Apply contact filter
    if (filters?.contact_id) {
      query = query.eq("contact_id", filters.contact_id);
    }

    // Apply search filter (search by title or contact name/email)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return data || [];
  }

  // Get deals grouped by stage for pipeline view
  static async getDealsPipeline(): Promise<Record<DealStage, Deal[]>> {
    const deals = await this.getDeals();

    const pipeline: Record<DealStage, Deal[]> = {
      lead: [],
      prospect: [],
      negotiation: [],
      "closed-won": [],
      "closed-lost": [],
    };

    deals.forEach((deal) => {
      pipeline[deal.stage].push(deal);
    });

    return pipeline;
  }

  // Get a single deal by ID
  static async getDeal(id: string): Promise<Deal | null> {
    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Deal not found
      }
      throw new Error(`Failed to fetch deal: ${error.message}`);
    }

    return data;
  }

  // Create a new deal
  static async createDeal(dealData: CreateDealInput): Promise<Deal> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deals")
      .insert({
        ...dealData,
        user_id: user.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    return data;
  }

  // Update an existing deal
  static async updateDeal(
    id: string,
    dealData: UpdateDealInput
  ): Promise<Deal> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deals")
      .update({
        ...dealData,
        updated_by: user.id,
      })
      .eq("id", id)
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    return data;
  }

  // Update deal stage (for drag and drop)
  static async updateDealStage(id: string, stage: DealStage): Promise<Deal> {
    return this.updateDeal(id, { stage });
  }

  // Delete a deal
  static async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete deal: ${error.message}`);
    }
  }

  // Get deals for a specific contact
  static async getDealsByContact(contactId: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from("deals")
      .select(
        `
        *,
        contact:contacts(*)
      `
      )
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals for contact: ${error.message}`);
    }

    return data || [];
  }

  // Get pipeline summary statistics
  static async getPipelineStats(): Promise<{
    totalDeals: number;
    totalValue: number;
    stageStats: Record<DealStage, { count: number; value: number }>;
  }> {
    const deals = await this.getDeals();

    const stats = {
      totalDeals: deals.length,
      totalValue: deals.reduce(
        (sum, deal) => sum + (deal.monetary_value || 0),
        0
      ),
      stageStats: {
        lead: { count: 0, value: 0 },
        prospect: { count: 0, value: 0 },
        negotiation: { count: 0, value: 0 },
        "closed-won": { count: 0, value: 0 },
        "closed-lost": { count: 0, value: 0 },
      } as Record<DealStage, { count: number; value: number }>,
    };

    deals.forEach((deal) => {
      stats.stageStats[deal.stage].count++;
      stats.stageStats[deal.stage].value += deal.monetary_value || 0;
    });

    return stats;
  }
}
