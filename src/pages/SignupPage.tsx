import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AuthLayout from "../components/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show success message and redirect to login
      alert(
        "Account created successfully! Please sign in with your credentials."
      );
      navigate("/login");
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us today and get started"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            label="Full name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            leftIcon={<UserIcon className="h-5 w-5" />}
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="Email address"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            leftIcon={<EnvelopeIcon className="h-5 w-5" />}
          />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            leftIcon={<LockClosedIcon className="h-5 w-5" />}
            hint="Must be at least 6 characters"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            label="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            leftIcon={<CheckCircleIcon className="h-5 w-5" />}
          />
        </div>

        {errors.general && (
          <div className="bg-error-50 border border-error-200 rounded-md p-3">
            <p className="text-error-600 text-sm text-center">
              {errors.general}
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
