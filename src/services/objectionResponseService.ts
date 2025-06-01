import { supabase } from "../lib/supabase";
import type {
  ObjectionHandlerResponse,
  CreateObjectionResponseInput,
} from "../types";

export class ObjectionResponseService {
  // Get all objection responses for the current user
  static async getObjectionResponses(): Promise<ObjectionHandlerResponse[]> {
    const { data, error } = await supabase
      .from("objection_responses")
      .select("*")
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch objection responses: ${error.message}`);
    }

    return data || [];
  }

  // Search objection responses by objection text
  static async searchByObjection(
    searchTerm: string
  ): Promise<ObjectionHandlerResponse[]> {
    const { data, error } = await supabase
      .from("objection_responses")
      .select("*")
      .ilike("objection", `%${searchTerm}%`)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search objection responses: ${error.message}`);
    }

    return data || [];
  }

  // Get responses by tone
  static async getResponsesByTone(
    tone: "professional" | "empathetic" | "confident" | "consultative"
  ): Promise<ObjectionHandlerResponse[]> {
    const { data, error } = await supabase
      .from("objection_responses")
      .select("*")
      .eq("tone", tone)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch responses by tone: ${error.message}`);
    }

    return data || [];
  }

  // Create a new objection response
  static async createObjectionResponse(
    responseData: CreateObjectionResponseInput
  ): Promise<ObjectionHandlerResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("objection_responses")
      .insert({
        ...responseData,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create objection response: ${error.message}`);
    }

    return data;
  }

  // Get a specific objection response by ID
  static async getObjectionResponse(
    id: string
  ): Promise<ObjectionHandlerResponse | null> {
    const { data, error } = await supabase
      .from("objection_responses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch objection response: ${error.message}`);
    }

    return data;
  }

  // Delete an objection response
  static async deleteObjectionResponse(id: string): Promise<void> {
    const { error } = await supabase
      .from("objection_responses")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete objection response: ${error.message}`);
    }
  }

  // Get objection response statistics
  static async getObjectionStats(): Promise<{
    totalResponses: number;
    thisMonthResponses: number;
    responsesByTone: Record<string, number>;
    topObjections: Array<{ objection: string; count: number }>;
  }> {
    const { data, error } = await supabase
      .from("objection_responses")
      .select("id, objection, tone, generated_at");

    if (error) {
      throw new Error(`Failed to fetch objection stats: ${error.message}`);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalResponses = data?.length || 0;
    const thisMonthResponses =
      data?.filter((response) => new Date(response.generated_at) >= thisMonth)
        .length || 0;

    // Count responses by tone
    const responsesByTone: Record<string, number> = {};
    data?.forEach((response) => {
      responsesByTone[response.tone] =
        (responsesByTone[response.tone] || 0) + 1;
    });

    // Count top objections
    const objectionCounts: Record<string, number> = {};
    data?.forEach((response) => {
      const objection = response.objection.toLowerCase().trim();
      objectionCounts[objection] = (objectionCounts[objection] || 0) + 1;
    });

    const topObjections = Object.entries(objectionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([objection, count]) => ({ objection, count }));

    return {
      totalResponses,
      thisMonthResponses,
      responsesByTone,
      topObjections,
    };
  }

  // Get recent objection responses (last 30 days)
  static async getRecentResponses(): Promise<ObjectionHandlerResponse[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("objection_responses")
      .select("*")
      .gte("generated_at", thirtyDaysAgo.toISOString())
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recent responses: ${error.message}`);
    }

    return data || [];
  }
}
