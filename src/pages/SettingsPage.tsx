import React from "react";
import { useForm } from "react-hook-form";
import {
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

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

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Notification settings form
  const {
    register: registerNotifications,
    handleSubmit: handleNotificationsSubmit,
    formState: { isSubmitting: isSubmittingNotifications },
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
  } = useForm<PreferencesSettings>({
    defaultValues: {
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
    },
  });

  const onNotificationsSubmit = async (data: NotificationSettings) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save notification settings:", err);
    }
  };

  const onPrivacySubmit = async (data: PrivacySettings) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save privacy settings:", err);
    }
  };

  const onPreferencesSubmit = async (data: PreferencesSettings) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

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
