import { supabase } from "../lib/supabase";
import type {
  Communication,
  CreateCommunicationInput,
  UpdateCommunicationInput,
  CommunicationFilters,
} from "../types";

export class CommunicationService {
  // Get all communications for the current user
  static async getCommunications(
    filters?: CommunicationFilters
  ): Promise<Communication[]> {
    let query = supabase
      .from("communications")
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
      .order("communication_date", { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
      );
    }

    // Apply type filter
    if (filters?.type) {
      query = query.eq("type", filters.type);
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
      query = query.gte("communication_date", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("communication_date", filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch communications: ${error.message}`);
    }

    return data || [];
  }

  // Get a single communication by ID
  static async getCommunication(id: string): Promise<Communication | null> {
    const { data, error } = await supabase
      .from("communications")
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
        return null; // Communication not found
      }
      throw new Error(`Failed to fetch communication: ${error.message}`);
    }

    return data;
  }

  // Create a new communication
  static async createCommunication(
    communicationData: CreateCommunicationInput
  ): Promise<Communication> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("communications")
      .insert({
        ...communicationData,
        user_id: user.id,
        communication_date:
          communicationData.communication_date || new Date().toISOString(),
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
      throw new Error(`Failed to create communication: ${error.message}`);
    }

    return data;
  }

  // Update an existing communication
  static async updateCommunication(
    id: string,
    communicationData: UpdateCommunicationInput
  ): Promise<Communication> {
    const { data, error } = await supabase
      .from("communications")
      .update(communicationData)
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
      throw new Error(`Failed to update communication: ${error.message}`);
    }

    return data;
  }

  // Delete a communication
  static async deleteCommunication(id: string): Promise<void> {
    const { error } = await supabase
      .from("communications")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete communication: ${error.message}`);
    }
  }

  // Get communications by contact ID
  static async getCommunicationsByContact(
    contactId: string
  ): Promise<Communication[]> {
    const { data, error } = await supabase
      .from("communications")
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
      .order("communication_date", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch communications for contact: ${error.message}`
      );
    }

    return data || [];
  }

  // Get communications by deal ID
  static async getCommunicationsByDeal(
    dealId: string
  ): Promise<Communication[]> {
    const { data, error } = await supabase
      .from("communications")
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
      .order("communication_date", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch communications for deal: ${error.message}`
      );
    }

    return data || [];
  }

  // Get recent communications (last 30 days)
  static async getRecentCommunications(
    limit: number = 10
  ): Promise<Communication[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("communications")
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
      .gte("communication_date", thirtyDaysAgo.toISOString())
      .order("communication_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(
        `Failed to fetch recent communications: ${error.message}`
      );
    }

    return data || [];
  }

  // Get communication statistics
  static async getCommunicationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    thisMonth: number;
  }> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("communications")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      throw new Error(
        `Failed to fetch total communications: ${totalError.message}`
      );
    }

    // Get count by type
    const { data: typeData, error: typeError } = await supabase
      .from("communications")
      .select("type");

    if (typeError) {
      throw new Error(
        `Failed to fetch communications by type: ${typeError.message}`
      );
    }

    const byType =
      typeData?.reduce((acc, comm) => {
        acc[comm.type] = (acc[comm.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get this month's count
    const { count: thisMonth, error: monthError } = await supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .gte("communication_date", firstDayOfMonth.toISOString());

    if (monthError) {
      throw new Error(
        `Failed to fetch this month's communications: ${monthError.message}`
      );
    }

    return {
      total: total || 0,
      byType,
      thisMonth: thisMonth || 0,
    };
  }
}
