import React from "react";
import { useForm } from "react-hook-form";
import {
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CpuChipIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { SettingsService } from "../services/settingsService";
import { resetOpenAIClient } from "../services/aiService";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "contacts";
  dataSharing: boolean;
  analyticsTracking: boolean;
}

interface PreferencesSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

interface AISettings {
  openaiApiKey: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);
  const [apiKeyTestResult, setApiKeyTestResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // AI settings form
  const {
    register: registerAI,
    handleSubmit: handleAISubmit,
    formState: { isSubmitting: isSubmittingAI },
    setValue: setAIValue,
    watch: watchAI,
  } = useForm<AISettings>({
    defaultValues: {
      openaiApiKey: "",
    },
  });

  // Notification settings form
  const {
    register: registerNotifications,
    handleSubmit: handleNotificationsSubmit,
    formState: { isSubmitting: isSubmittingNotifications },
    setValue: setNotificationValue,
  } = useForm<NotificationSettings>({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  // Privacy settings form
  const {
    register: registerPrivacy,
    handleSubmit: handlePrivacySubmit,
    formState: { isSubmitting: isSubmittingPrivacy },
    setValue: setPrivacyValue,
  } = useForm<PrivacySettings>({
    defaultValues: {
      profileVisibility: "private",
      dataSharing: false,
      analyticsTracking: true,
    },
  });

  // Preferences settings form
  const {
    register: registerPreferences,
    handleSubmit: handlePreferencesSubmit,
    formState: { isSubmitting: isSubmittingPreferences },
    setValue: setPreferencesValue,
  } = useForm<PreferencesSettings>({
    defaultValues: {
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
    },
  });

  // Load user settings on component mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.getUserSettings();
        if (settings) {
          // Set AI settings
          if (settings.openai_api_key) {
            setAIValue("openaiApiKey", settings.openai_api_key);
          }

          // Set notification settings
          if (settings.preferences?.notifications) {
            const notifications = settings.preferences.notifications;
            setNotificationValue(
              "emailNotifications",
              notifications.emailNotifications
            );
            setNotificationValue(
              "pushNotifications",
              notifications.pushNotifications
            );
            setNotificationValue(
              "marketingEmails",
              notifications.marketingEmails
            );
            setNotificationValue(
              "securityAlerts",
              notifications.securityAlerts
            );
          }

          // Set privacy settings
          if (settings.preferences?.privacy) {
            const privacy = settings.preferences.privacy;
            setPrivacyValue("profileVisibility", privacy.profileVisibility);
            setPrivacyValue("dataSharing", privacy.dataSharing);
            setPrivacyValue("analyticsTracking", privacy.analyticsTracking);
          }

          // Set preferences settings
          if (settings.preferences?.preferences) {
            const preferences = settings.preferences.preferences;
            setPreferencesValue("language", preferences.language);
            setPreferencesValue("timezone", preferences.timezone);
            setPreferencesValue("dateFormat", preferences.dateFormat);
            setPreferencesValue("currency", preferences.currency);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, [setAIValue, setNotificationValue, setPrivacyValue, setPreferencesValue]);

  const showSuccessMessage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const onAISubmit = async (data: AISettings) => {
    try {
      if (data.openaiApiKey.trim()) {
        await SettingsService.updateOpenAIApiKey(data.openaiApiKey.trim());
      } else {
        await SettingsService.deleteOpenAIApiKey();
      }

      // Reset the OpenAI client so it picks up the new API key
      resetOpenAIClient();

      showSuccessMessage();
      setApiKeyTestResult(null);
    } catch (err) {
      console.error("Failed to save AI settings:", err);
    }
  };

  const testApiKey = async () => {
    const apiKey = watchAI("openaiApiKey");
    if (!apiKey?.trim()) {
      setApiKeyTestResult({
        success: false,
        message: "Please enter an API key to test",
      });
      return;
    }

    try {
      // Test the API key by making a simple request
      const testClient = new (await import("openai")).default({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      });

      await testClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 1,
      });

      setApiKeyTestResult({
        success: true,
        message: "API key is valid and working!",
      });
    } catch (error: any) {
      setApiKeyTestResult({
        success: false,
        message: error.message || "Invalid API key or connection failed",
      });
    }
  };

  const onNotificationsSubmit = async (data: NotificationSettings) => {
    try {
      await SettingsService.updateUserSettings({
        preferences: {
          notifications: data,
        },
      });
      showSuccessMessage();
    } catch (err) {
      console.error("Failed to save notification settings:", err);
    }
  };

  const onPrivacySubmit = async (data: PrivacySettings) => {
    try {
      await SettingsService.updateUserSettings({
        preferences: {
          privacy: data,
        },
      });
      showSuccessMessage();
    } catch (err) {
      console.error("Failed to save privacy settings:", err);
    }
  };

  const onPreferencesSubmit = async (data: PreferencesSettings) => {
    try {
      await SettingsService.updateUserSettings({
        preferences: {
          preferences: data,
        },
      });
      showSuccessMessage();
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your account preferences and application settings.
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-success-50 border border-success-200 rounded-md p-3">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
            <p className="text-success-600 text-sm">
              Settings saved successfully!
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* AI Settings */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
              <CpuChipIcon className="h-5 w-5 mr-2" />
              AI Configuration
            </h2>
            <p className="text-sm text-text-secondary">
              Configure your OpenAI API key to enable AI features like contact
              personas, objection handling, and deal coaching.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAISubmit(onAISubmit)}>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  className="w-full px-3 py-2 pr-20 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="sk-..."
                  {...registerAI("openaiApiKey")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-12 flex items-center px-2 text-text-secondary hover:text-text-primary"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  onClick={testApiKey}
                >
                  Test
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                Your API key is stored securely and only used for AI features.
                Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  OpenAI Platform
                </a>
              </p>

              {/* API Key Test Result */}
              {apiKeyTestResult && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    apiKeyTestResult.success
                      ? "bg-success-50 text-success-700 border border-success-200"
                      : "bg-error-50 text-error-700 border border-error-200"
                  }`}
                >
                  {apiKeyTestResult.message}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={isSubmittingAI} className="px-6">
                Save AI Settings
              </Button>
            </div>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </h2>
            <p className="text-sm text-text-secondary">
              Manage how you receive notifications and updates.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={handleNotificationsSubmit(onNotificationsSubmit)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Email Notifications
                  </label>
                  <p className="text-sm text-text-secondary">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerNotifications("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Push Notifications
                  </label>
                  <p className="text-sm text-text-secondary">
                    Receive push notifications in your browser
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerNotifications("pushNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Marketing Emails
                  </label>
                  <p className="text-sm text-text-secondary">
                    Receive emails about new features and updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerNotifications("marketingEmails")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Security Alerts
                  </label>
                  <p className="text-sm text-text-secondary">
                    Receive important security notifications
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerNotifications("securityAlerts")}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmittingNotifications}
                className="px-6"
              >
                Save Notifications
              </Button>
            </div>
          </form>
        </div>

        {/* Privacy Settings */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Privacy & Security
            </h2>
            <p className="text-sm text-text-secondary">
              Control your privacy settings and data sharing preferences.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={handlePrivacySubmit(onPrivacySubmit)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Profile Visibility
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...registerPrivacy("profileVisibility")}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts">Contacts Only</option>
                </select>
                <p className="text-sm text-text-secondary mt-1">
                  Choose who can see your profile information
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Data Sharing
                  </label>
                  <p className="text-sm text-text-secondary">
                    Allow sharing of anonymized usage data
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerPrivacy("dataSharing")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Analytics Tracking
                  </label>
                  <p className="text-sm text-text-secondary">
                    Help improve the app with usage analytics
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                  {...registerPrivacy("analyticsTracking")}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmittingPrivacy}
                className="px-6"
              >
                Save Privacy Settings
              </Button>
            </div>
          </form>
        </div>

        {/* Preferences Settings */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Preferences
            </h2>
            <p className="text-sm text-text-secondary">
              Customize your regional and display preferences.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={handlePreferencesSubmit(onPreferencesSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Language
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...registerPreferences("language")}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Timezone
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...registerPreferences("timezone")}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date Format
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...registerPreferences("dateFormat")}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  {...registerPreferences("currency")}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={isSubmittingPreferences}
                className="px-6"
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
