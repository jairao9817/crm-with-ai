import React from "react";
import { useForm } from "react-hook-form";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = React.useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] =
    React.useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setError: setProfileError,
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.user_metadata?.name || "",
      email: user?.email || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    setError: setPasswordError,
    watch: watchPassword,
    reset: resetPassword,
  } = useForm<PasswordFormData>();

  const newPassword = watchPassword("newPassword");

  React.useEffect(() => {
    if (user) {
      resetProfile({
        name: user.user_metadata?.name || "",
        email: user.email || "",
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    setProfileUpdateSuccess(false);

    try {
      // Note: In a real implementation, you would update the user profile via Supabase
      // For now, we'll simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfileUpdateSuccess(true);
      setTimeout(() => setProfileUpdateSuccess(false), 3000);
    } catch (err) {
      setProfileError("root", {
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const { error } = await updatePassword(data.newPassword);

      if (error) {
        setPasswordError("root", { message: error.message });
      } else {
        setPasswordUpdateSuccess(true);
        resetPassword();
        setTimeout(() => setPasswordUpdateSuccess(false), 3000);
      }
    } catch (err) {
      setPasswordError("root", {
        message: "Failed to update password. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-text-primary">
                Profile Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Information Section */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Profile Information
              </h2>
              <p className="text-sm text-text-secondary">
                Update your account's profile information and email address.
              </p>
            </div>

            {profileUpdateSuccess && (
              <div className="mb-6 bg-success-50 border border-success-200 rounded-md p-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
                  <p className="text-success-600 text-sm">
                    Profile updated successfully!
                  </p>
                </div>
              </div>
            )}

            <form
              className="space-y-6"
              onSubmit={handleProfileSubmit(onProfileSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name"
                  type="text"
                  label="Full Name"
                  error={profileErrors.name?.message}
                  leftIcon={<UserIcon className="h-5 w-5" />}
                  {...registerProfile("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  error={profileErrors.email?.message}
                  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                  disabled
                  hint="Email cannot be changed"
                  {...registerProfile("email")}
                />
              </div>

              {profileErrors.root && (
                <div className="bg-error-50 border border-error-200 rounded-md p-3">
                  <p className="text-error-600 text-sm">
                    {profileErrors.root.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isUpdatingProfile}
                  className="px-6"
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Change Password
              </h2>
              <p className="text-sm text-text-secondary">
                Ensure your account is using a long, random password to stay
                secure.
              </p>
            </div>

            {passwordUpdateSuccess && (
              <div className="mb-6 bg-success-50 border border-success-200 rounded-md p-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
                  <p className="text-success-600 text-sm">
                    Password updated successfully!
                  </p>
                </div>
              </div>
            )}

            <form
              className="space-y-6"
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            >
              <div className="space-y-4">
                <Input
                  id="currentPassword"
                  type="password"
                  label="Current Password"
                  error={passwordErrors.currentPassword?.message}
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  {...registerPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                />
                <Input
                  id="newPassword"
                  type="password"
                  label="New Password"
                  error={passwordErrors.newPassword?.message}
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  hint="Must be at least 6 characters"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  error={passwordErrors.confirmPassword?.message}
                  leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
              </div>

              {passwordErrors.root && (
                <div className="bg-error-50 border border-error-200 rounded-md p-3">
                  <p className="text-error-600 text-sm">
                    {passwordErrors.root.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isSubmittingPassword}
                  className="px-6"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account Information Section */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Account Information
              </h2>
              <p className="text-sm text-text-secondary">
                View your account details and registration information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  User ID
                </label>
                <p className="text-sm text-text-secondary bg-background-secondary p-3 rounded-md border border-border font-mono">
                  {user?.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Account Created
                </label>
                <p className="text-sm text-text-secondary bg-background-secondary p-3 rounded-md border border-border">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Email Verified
                </label>
                <p className="text-sm text-text-secondary bg-background-secondary p-3 rounded-md border border-border">
                  {user?.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Last Sign In
                </label>
                <p className="text-sm text-text-secondary bg-background-secondary p-3 rounded-md border border-border">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
