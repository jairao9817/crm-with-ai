import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { ThemeToggle } from "./ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle showLabel={false} />
        </div>

        <div>
          {/* Logo/Icon */}
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-6">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl font-bold text-text-primary">
            {title}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-3 text-center text-sm text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-surface border border-border rounded-lg shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
