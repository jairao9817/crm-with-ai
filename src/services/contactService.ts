import { supabase } from "../lib/supabase";
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
} from "../types";

export class ContactService {
  // Get all contacts for the current user
  static async getContacts(filters?: ContactFilters): Promise<Contact[]> {
    let query = supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply search filter
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
      );
    }

    // Apply company filter
    if (filters?.company) {
      query = query.eq("company", filters.company);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    return data || [];
  }

  // Get a single contact by ID
  static async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Contact not found
      }
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }

    return data;
  }

  // Create a new contact
  static async createContact(
    contactData: CreateContactInput
  ): Promise<Contact> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        ...contactData,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A contact with this email already exists");
      }
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return data;
  }

  // Update an existing contact
  static async updateContact(
    id: string,
    contactData: UpdateContactInput
  ): Promise<Contact> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("contacts")
      .update({
        ...contactData,
        updated_by: user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A contact with this email already exists");
      }
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return data;
  }

  // Delete a contact
  static async deleteContact(id: string): Promise<void> {
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  // Check for duplicate contacts by email
  static async checkDuplicate(
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase.from("contacts").select("id").eq("email", email);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to check for duplicates: ${error.message}`);
    }

    return (data?.length || 0) > 0;
  }

  // Get unique companies for filter dropdown
  static async getCompanies(): Promise<string[]> {
    const { data, error } = await supabase
      .from("contacts")
      .select("company")
      .not("company", "is", null)
      .not("company", "eq", "");

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    const companies = Array.from(
      new Set(data?.map((item) => item.company).filter(Boolean))
    ) as string[];
    return companies.sort();
  }
}
