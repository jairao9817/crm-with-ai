import { supabase } from "../lib/supabase";

export interface UserSettings {
  id: string;
  user_id: string;
  openai_api_key?: string;
  preferences: {
    notifications: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      marketingEmails: boolean;
      securityAlerts: boolean;
    };
    privacy: {
      profileVisibility: "public" | "private" | "contacts";
      dataSharing: boolean;
      analyticsTracking: boolean;
    };
    preferences: {
      language: string;
      timezone: string;
      dateFormat: string;
      currency: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsInput {
  openai_api_key?: string;
  preferences?: Partial<UserSettings["preferences"]>;
}

export class SettingsService {
  static async getUserSettings(): Promise<UserSettings | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
  }

  static async updateUserSettings(
    settings: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get existing settings
      const existingSettings = await this.getUserSettings();

      const settingsData = {
        user_id: user.id,
        openai_api_key: settings.openai_api_key,
        preferences: settings.preferences ||
          existingSettings?.preferences || {
            notifications: {
              emailNotifications: true,
              pushNotifications: false,
              marketingEmails: false,
              securityAlerts: true,
            },
            privacy: {
              profileVisibility: "private" as const,
              dataSharing: false,
              analyticsTracking: true,
            },
            preferences: {
              language: "en",
              timezone: "UTC",
              dateFormat: "MM/DD/YYYY",
              currency: "USD",
            },
          },
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_settings")
        .upsert(settingsData, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }

  static async getOpenAIApiKey(): Promise<string | null> {
    try {
      const settings = await this.getUserSettings();
      return settings?.openai_api_key || null;
    } catch (error) {
      console.error("Error fetching OpenAI API key:", error);
      return null;
    }
  }

  static async updateOpenAIApiKey(apiKey: string): Promise<void> {
    try {
      await this.updateUserSettings({ openai_api_key: apiKey });
    } catch (error) {
      console.error("Error updating OpenAI API key:", error);
      throw error;
    }
  }

  static async deleteOpenAIApiKey(): Promise<void> {
    try {
      await this.updateUserSettings({ openai_api_key: null });
    } catch (error) {
      console.error("Error deleting OpenAI API key:", error);
      throw error;
    }
  }

  static async createDefaultSettings(): Promise<UserSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const defaultSettings = {
        user_id: user.id,
        preferences: {
          notifications: {
            emailNotifications: true,
            pushNotifications: false,
            marketingEmails: false,
            securityAlerts: true,
          },
          privacy: {
            profileVisibility: "private" as const,
            dataSharing: false,
            analyticsTracking: true,
          },
          preferences: {
            language: "en",
            timezone: "UTC",
            dateFormat: "MM/DD/YYYY",
            currency: "USD",
          },
        },
      };

      const { data, error } = await supabase
        .from("user_settings")
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating default settings:", error);
      throw error;
    }
  }
}
