import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const success = await login(email, password);

      if (success) {
        navigate("/home");
      } else {
        setErrors({ general: "Invalid email or password" });
      }
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Use admin@example.com / password123 for demo"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            leftIcon={<EnvelopeIcon className="h-5 w-5" />}
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            leftIcon={<LockClosedIcon className="h-5 w-5" />}
          />
        </div>

        {errors.general && (
          <div className="bg-error-50 border border-error-200 rounded-md p-3">
            <p className="text-error-600 text-sm text-center">
              {errors.general}
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
