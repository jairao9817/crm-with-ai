import { supabase } from "../lib/supabase";
import type {
  CommunicationNote,
  CreateCommunicationNoteInput,
  UpdateCommunicationNoteInput,
} from "../types";

export class CommunicationNotesService {
  // Get all notes for a specific communication
  static async getNotesByCommunication(
    communicationId: string
  ): Promise<CommunicationNote[]> {
    const { data, error } = await supabase
      .from("communication_notes")
      .select("*")
      .eq("communication_id", communicationId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch communication notes: ${error.message}`);
    }

    return data || [];
  }

  // Get a single note by ID
  static async getNote(id: string): Promise<CommunicationNote | null> {
    const { data, error } = await supabase
      .from("communication_notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Note not found
      }
      throw new Error(`Failed to fetch communication note: ${error.message}`);
    }

    return data;
  }

  // Create a new note
  static async createNote(
    noteData: CreateCommunicationNoteInput
  ): Promise<CommunicationNote> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("communication_notes")
      .insert({
        ...noteData,
        created_by: user.id,
        note_type: noteData.note_type || "reply",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create communication note: ${error.message}`);
    }

    return data;
  }

  // Update an existing note
  static async updateNote(
    id: string,
    noteData: UpdateCommunicationNoteInput
  ): Promise<CommunicationNote> {
    const { data, error } = await supabase
      .from("communication_notes")
      .update(noteData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update communication note: ${error.message}`);
    }

    return data;
  }

  // Delete a note
  static async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from("communication_notes")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete communication note: ${error.message}`);
    }
  }

  // Get notes by type for a communication
  static async getNotesByType(
    communicationId: string,
    noteType: string
  ): Promise<CommunicationNote[]> {
    const { data, error } = await supabase
      .from("communication_notes")
      .select("*")
      .eq("communication_id", communicationId)
      .eq("note_type", noteType)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to fetch communication notes by type: ${error.message}`
      );
    }

    return data || [];
  }

  // Get recent notes (last 30 days)
  static async getRecentNotes(
    limit: number = 10
  ): Promise<CommunicationNote[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("communication_notes")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(
        `Failed to fetch recent communication notes: ${error.message}`
      );
    }

    return data || [];
  }
}
