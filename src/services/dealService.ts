import { supabase } from "../lib/supabase";
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealFilters,
  DealStage,
  Task,
  Communication,
  PurchaseHistory,
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

    // Get current deal state if stage is being updated
    let currentDeal: Deal | null = null;
    if (dealData.stage) {
      currentDeal = await this.getDeal(id);
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

    // Auto-create purchase history if deal is being closed as won
    if (
      dealData.stage === "closed-won" &&
      currentDeal &&
      currentDeal.stage !== "closed-won"
    ) {
      try {
        await this.createPurchaseHistoryFromDeal(data);
      } catch (error) {
        console.warn("Failed to create purchase history from deal:", error);
        // Don't fail the deal update if purchase history creation fails
      }
    }

    return data;
  }

  // Update deal stage (for drag and drop)
  static async updateDealStage(id: string, stage: DealStage): Promise<Deal> {
    // Get the current deal first
    const currentDeal = await this.getDeal(id);
    if (!currentDeal) {
      throw new Error("Deal not found");
    }

    // Update the deal
    const updatedDeal = await this.updateDeal(id, { stage });

    return updatedDeal;
  }

  // Close deal as won with optional manual purchase creation
  static async closeDealAsWon(
    id: string,
    createPurchaseHistory: boolean = true
  ): Promise<Deal> {
    const currentDeal = await this.getDeal(id);
    if (!currentDeal) {
      throw new Error("Deal not found");
    }

    if (currentDeal.stage === "closed-won") {
      return currentDeal; // Already closed as won
    }

    // Update deal to closed-won
    const updatedDeal = await this.updateDeal(id, { stage: "closed-won" });

    // Create purchase history if requested and not already created automatically
    if (
      createPurchaseHistory &&
      currentDeal.contact_id &&
      currentDeal.monetary_value > 0
    ) {
      try {
        await this.createPurchaseHistoryFromDeal(updatedDeal);
      } catch (error) {
        console.warn("Failed to create purchase history from deal:", error);
        // Don't fail the deal update if purchase history creation fails
      }
    }

    return updatedDeal;
  }

  // Private method to create purchase history from deal
  private static async createPurchaseHistoryFromDeal(
    deal: Deal
  ): Promise<void> {
    if (!deal.contact_id || deal.monetary_value <= 0) {
      return; // Skip if no contact or no value
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Import PurchaseHistoryService to avoid circular dependency
    const { PurchaseHistoryService } = await import("./purchaseHistoryService");

    await PurchaseHistoryService.createPurchaseHistory({
      contact_id: deal.contact_id,
      deal_id: deal.id,
      date: new Date().toISOString().split("T")[0], // Today's date
      amount: deal.monetary_value,
      product_service: deal.title, // Use deal title as product/service
      status: "completed",
    });
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

  // AI Deal Coach: Get AI-generated next steps for a deal
  static async getAIDealCoachSuggestions(
    deal: Deal,
    context: {
      tasks?: Task[];
      communications?: Communication[];
      purchaseHistory?: PurchaseHistory[];
    }
  ): Promise<string> {
    // Prepare prompt for OpenAI
    const prompt = `You are a sales deal coach. Given the following deal information, suggest the next best steps to improve the probability of closing the deal.\n\nDeal:\n${JSON.stringify(
      deal,
      null,
      2
    )}\n\nTasks:\n${JSON.stringify(
      context.tasks || [],
      null,
      2
    )}\n\nCommunications:\n${JSON.stringify(
      context.communications || [],
      null,
      2
    )}\n\nPurchase History:\n${JSON.stringify(
      context.purchaseHistory || [],
      null,
      2
    )}\n\nRespond with a concise, actionable list of next steps for the sales rep.`;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OpenAI API key (VITE_OPENAI_API_KEY)");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful sales deal coach AI." },
          { role: "user", content: prompt },
        ],
        max_tokens: 30,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    // This assumes OpenAI's response format for chat completions
    return (
      data.choices?.[0]?.message?.content?.trim() || "No suggestions returned."
    );
  }
}
