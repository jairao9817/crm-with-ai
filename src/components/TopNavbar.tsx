import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { DropdownMenu } from "./ui/DropdownMenu";
import type { DropdownMenuItem } from "./ui/DropdownMenu";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/Button";

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
  showMobileMenuButton?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onMobileMenuToggle,
  showMobileMenuButton = true,
}) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const profileMenuItems: DropdownMenuItem[] = [
    {
      label: "Profile",
      href: "/profile",
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Cog6ToothIcon className="h-4 w-4" />,
    },
    {
      label: "Logout",
      onClick: handleLogout,
      icon: <ArrowRightOnRectangleIcon className="h-4 w-4" />,
      destructive: true,
    },
  ];

  const userInitial = user?.user_metadata?.name?.[0] || user?.email?.[0] || "U";
  const userName = user?.user_metadata?.name || "User";

  return (
    <nav className="bg-surface border-b border-border shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            {showMobileMenuButton && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors mr-3"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary">CRM AI</h1>
            </div>
          </div>

          {/* Right side - Theme toggle and profile dropdown */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle showLabel={false} />
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 hover:bg-background-secondary"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitial}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-text-primary">
                    {userName}
                  </span>
                </Button>
              }
              items={profileMenuItems}
              align="right"
              className="ml-3"
            />
          </div>
        </div>
      </div>

      {/* Mobile theme toggle */}
      <div className="sm:hidden border-t border-border px-4 py-2">
        <div className="flex justify-center">
          <ThemeToggle showLabel={true} />
        </div>
      </div>
    </nav>
  );
};
