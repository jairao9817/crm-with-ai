import { supabase } from "../lib/supabase";
import type { ContactPersona, CreateContactPersonaInput } from "../types";

export class ContactPersonaService {
  // Get all personas for a specific contact
  static async getPersonasByContact(
    contactId: string
  ): Promise<ContactPersona[]> {
    const { data, error } = await supabase
      .from("contact_personas")
      .select("*")
      .eq("contact_id", contactId)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contact personas: ${error.message}`);
    }

    return data || [];
  }

  // Get the latest persona for a contact
  static async getLatestPersona(
    contactId: string
  ): Promise<ContactPersona | null> {
    const { data, error } = await supabase
      .from("contact_personas")
      .select("*")
      .eq("contact_id", contactId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch latest persona: ${error.message}`);
    }

    return data;
  }

  // Create a new persona
  static async createPersona(
    personaData: CreateContactPersonaInput
  ): Promise<ContactPersona> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("contact_personas")
      .insert({
        ...personaData,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create persona: ${error.message}`);
    }

    return data;
  }

  // Get a specific persona by ID
  static async getPersona(id: string): Promise<ContactPersona | null> {
    const { data, error } = await supabase
      .from("contact_personas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch persona: ${error.message}`);
    }

    return data;
  }

  // Delete a persona
  static async deletePersona(id: string): Promise<void> {
    const { error } = await supabase
      .from("contact_personas")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete persona: ${error.message}`);
    }
  }

  // Get all personas for the current user
  static async getUserPersonas(): Promise<ContactPersona[]> {
    const { data, error } = await supabase
      .from("contact_personas")
      .select(
        `
        *,
        contact:contacts(
          id,
          name,
          email,
          company
        )
      `
      )
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user personas: ${error.message}`);
    }

    return data || [];
  }

  // Get persona statistics
  static async getPersonaStats(): Promise<{
    totalPersonas: number;
    thisMonthPersonas: number;
    contactsWithPersonas: number;
  }> {
    const { data, error } = await supabase
      .from("contact_personas")
      .select("id, contact_id, generated_at");

    if (error) {
      throw new Error(`Failed to fetch persona stats: ${error.message}`);
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPersonas = data?.length || 0;
    const thisMonthPersonas =
      data?.filter((persona) => new Date(persona.generated_at) >= thisMonth)
        .length || 0;

    const uniqueContacts = new Set(data?.map((p) => p.contact_id) || []);
    const contactsWithPersonas = uniqueContacts.size;

    return {
      totalPersonas,
      thisMonthPersonas,
      contactsWithPersonas,
    };
  }
}
