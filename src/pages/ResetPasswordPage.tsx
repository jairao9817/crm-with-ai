import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LockClosedIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>();

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [searchParams] = useSearchParams();

  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  useEffect(() => {
    // Check if we have the access token and refresh token from the URL
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      // If no tokens, redirect to forgot password page
      navigate("/forgot-password");
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        setError("root", { message: error.message });
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("root", { message: "An error occurred. Please try again." });
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated successfully"
        subtitle="Your password has been changed"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100 mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <p className="text-sm text-text-secondary mb-6">
              Your password has been successfully updated. You can now sign in
              with your new password.
            </p>
          </div>

          <Button
            onClick={() => navigate("/login")}
            variant="primary"
            className="w-full"
            size="lg"
          >
            Continue to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            label="New password"
            error={errors.password?.message}
            leftIcon={<LockClosedIcon className="h-5 w-5" />}
            hint="Must be at least 6 characters"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            label="Confirm new password"
            error={errors.confirmPassword?.message}
            leftIcon={<CheckCircleIcon className="h-5 w-5" />}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
        </div>

        {errors.root && (
          <div className="bg-error-50 border border-error-200 rounded-md p-3">
            <p className="text-error-600 text-sm text-center">
              {errors.root.message}
            </p>
          </div>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
