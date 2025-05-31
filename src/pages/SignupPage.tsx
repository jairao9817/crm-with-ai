import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<SignupFormData>();

  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const { signUp } = useAuth();
  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { error } = await signUp(data.email, data.password, data.name);

      if (error) {
        setError("root", { message: error.message });
      } else {
        setSubmittedEmail(data.email);
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
        subtitle="We've sent you a confirmation link"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-success-100 mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <p className="text-sm text-text-secondary mb-6">
              We've sent a confirmation email to{" "}
              <strong className="text-text-primary">{submittedEmail}</strong>.
              Please check your inbox and click the confirmation link to
              activate your account.
            </p>
            <p className="text-xs text-text-tertiary mb-6">
              Didn't receive the email? Check your spam folder or try signing up
              again.
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
      title="Create your account"
      subtitle="Join us today and get started"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            label="Full name"
            error={errors.name?.message}
            leftIcon={<UserIcon className="h-5 w-5" />}
            {...register("name", {
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
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            label="Password"
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
            label="Confirm password"
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
          Create account
        </Button>

        <div className="text-center">
          <span className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
