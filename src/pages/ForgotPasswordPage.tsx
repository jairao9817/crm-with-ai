import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordFormData>();

  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const { resetPassword } = useAuth();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        setError("root", { message: error.message });
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      setError("root", { message: "An error occurred. Please try again." });
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100 mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <p className="text-sm text-text-secondary mb-6">
              We've sent a password reset link to{" "}
              <strong className="text-text-primary">
                {getValues("email")}
              </strong>
              . Please check your inbox and click the link to reset your
              password.
            </p>
            <p className="text-xs text-text-tertiary mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <Link to="/login">
            <Button variant="primary" className="w-full" size="lg">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          label="Email address"
          error={errors.email?.message}
          leftIcon={<EnvelopeIcon className="h-5 w-5" />}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Email is invalid",
            },
          })}
        />

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
          Send reset link
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
