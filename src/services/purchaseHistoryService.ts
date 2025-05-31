import { supabase } from "../lib/supabase";
import type {
  PurchaseHistory,
  CreatePurchaseHistoryInput,
  UpdatePurchaseHistoryInput,
  PurchaseHistoryFilters,
} from "../types";

export class PurchaseHistoryService {
  // Get all purchase history for the current user
  static async getPurchaseHistory(
    filters?: PurchaseHistoryFilters
  ): Promise<PurchaseHistory[]> {
    let query = supabase
      .from("purchase_history")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .order("date", { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(`product_service.ilike.%${filters.search}%`);
    }

    // Apply status filter
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    // Apply contact filter
    if (filters?.contact_id) {
      query = query.eq("contact_id", filters.contact_id);
    }

    // Apply deal filter
    if (filters?.deal_id) {
      query = query.eq("deal_id", filters.deal_id);
    }

    // Apply date range filters
    if (filters?.date_from) {
      query = query.gte("date", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("date", filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch purchase history: ${error.message}`);
    }

    return data || [];
  }

  // Get a single purchase history record by ID
  static async getPurchaseHistoryRecord(
    id: string
  ): Promise<PurchaseHistory | null> {
    const { data, error } = await supabase
      .from("purchase_history")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Purchase history record not found
      }
      throw new Error(
        `Failed to fetch purchase history record: ${error.message}`
      );
    }

    return data;
  }

  // Create a new purchase history record
  static async createPurchaseHistory(
    purchaseData: CreatePurchaseHistoryInput
  ): Promise<PurchaseHistory> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("purchase_history")
      .insert({
        ...purchaseData,
        created_by: user.id,
      })
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to create purchase history record: ${error.message}`
      );
    }

    return data;
  }

  // Update an existing purchase history record
  static async updatePurchaseHistory(
    id: string,
    purchaseData: UpdatePurchaseHistoryInput
  ): Promise<PurchaseHistory> {
    const { data, error } = await supabase
      .from("purchase_history")
      .update(purchaseData)
      .eq("id", id)
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to update purchase history record: ${error.message}`
      );
    }

    return data;
  }

  // Delete a purchase history record
  static async deletePurchaseHistory(id: string): Promise<void> {
    const { error } = await supabase
      .from("purchase_history")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to delete purchase history record: ${error.message}`
      );
    }
  }

  // Get purchase history by contact ID
  static async getPurchaseHistoryByContact(
    contactId: string
  ): Promise<PurchaseHistory[]> {
    const { data, error } = await supabase
      .from("purchase_history")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .eq("contact_id", contactId)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch purchase history for contact: ${error.message}`
      );
    }

    return data || [];
  }

  // Get purchase history by deal ID
  static async getPurchaseHistoryByDeal(
    dealId: string
  ): Promise<PurchaseHistory[]> {
    const { data, error } = await supabase
      .from("purchase_history")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .eq("deal_id", dealId)
      .order("date", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch purchase history for deal: ${error.message}`
      );
    }

    return data || [];
  }

  // Get revenue analysis for a contact
  static async getContactRevenue(contactId: string): Promise<{
    totalRevenue: number;
    completedRevenue: number;
    pendingRevenue: number;
    refundedRevenue: number;
    purchaseCount: number;
  }> {
    const { data, error } = await supabase
      .from("purchase_history")
      .select("amount, status")
      .eq("contact_id", contactId);

    if (error) {
      throw new Error(`Failed to fetch contact revenue: ${error.message}`);
    }

    const stats = data?.reduce(
      (acc, purchase) => {
        acc.totalRevenue += purchase.amount;
        acc.purchaseCount += 1;

        switch (purchase.status) {
          case "completed":
            acc.completedRevenue += purchase.amount;
            break;
          case "pending":
            acc.pendingRevenue += purchase.amount;
            break;
          case "refunded":
            acc.refundedRevenue += purchase.amount;
            break;
        }

        return acc;
      },
      {
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        refundedRevenue: 0,
        purchaseCount: 0,
      }
    ) || {
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      refundedRevenue: 0,
      purchaseCount: 0,
    };

    return stats;
  }

  // Get revenue analysis for a deal
  static async getDealRevenue(dealId: string): Promise<{
    totalRevenue: number;
    completedRevenue: number;
    pendingRevenue: number;
    refundedRevenue: number;
    purchaseCount: number;
  }> {
    const { data, error } = await supabase
      .from("purchase_history")
      .select("amount, status")
      .eq("deal_id", dealId);

    if (error) {
      throw new Error(`Failed to fetch deal revenue: ${error.message}`);
    }

    const stats = data?.reduce(
      (acc, purchase) => {
        acc.totalRevenue += purchase.amount;
        acc.purchaseCount += 1;

        switch (purchase.status) {
          case "completed":
            acc.completedRevenue += purchase.amount;
            break;
          case "pending":
            acc.pendingRevenue += purchase.amount;
            break;
          case "refunded":
            acc.refundedRevenue += purchase.amount;
            break;
        }

        return acc;
      },
      {
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        refundedRevenue: 0,
        purchaseCount: 0,
      }
    ) || {
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      refundedRevenue: 0,
      purchaseCount: 0,
    };

    return stats;
  }

  // Get overall revenue statistics
  static async getRevenueStats(): Promise<{
    totalRevenue: number;
    completedRevenue: number;
    pendingRevenue: number;
    refundedRevenue: number;
    thisMonthRevenue: number;
    purchaseCount: number;
  }> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Get all purchase history
    const { data, error } = await supabase
      .from("purchase_history")
      .select("amount, status, date");

    if (error) {
      throw new Error(`Failed to fetch revenue statistics: ${error.message}`);
    }

    const stats = data?.reduce(
      (acc, purchase) => {
        acc.totalRevenue += purchase.amount;
        acc.purchaseCount += 1;

        // Check if purchase is from this month
        const purchaseDate = new Date(purchase.date);
        if (purchaseDate >= firstDayOfMonth) {
          acc.thisMonthRevenue += purchase.amount;
        }

        switch (purchase.status) {
          case "completed":
            acc.completedRevenue += purchase.amount;
            break;
          case "pending":
            acc.pendingRevenue += purchase.amount;
            break;
          case "refunded":
            acc.refundedRevenue += purchase.amount;
            break;
        }

        return acc;
      },
      {
        totalRevenue: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        refundedRevenue: 0,
        thisMonthRevenue: 0,
        purchaseCount: 0,
      }
    ) || {
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      refundedRevenue: 0,
      thisMonthRevenue: 0,
      purchaseCount: 0,
    };

    return stats;
  }

  // Get recent purchases (last 30 days)
  static async getRecentPurchases(
    limit: number = 10
  ): Promise<PurchaseHistory[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("purchase_history")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        deal:deals(
          id,
          title,
          stage
        )
      `
      )
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent purchases: ${error.message}`);
    }

    return data || [];
  }
}
