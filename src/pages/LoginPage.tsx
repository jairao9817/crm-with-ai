import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>();

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        setError("root", { message: error.message });
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("root", { message: "An error occurred. Please try again." });
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
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
            autoComplete="current-password"
            label="Password"
            error={errors.password?.message}
            leftIcon={<LockClosedIcon className="h-5 w-5" />}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
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

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Sign in
        </Button>

        <div className="text-center">
          <span className="text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
