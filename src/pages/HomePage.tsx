import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  BriefcaseIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: "Total Contacts",
      value: "2,651",
      icon: UserIcon,
      color: "text-primary-600",
    },
    {
      name: "Active Deals",
      value: "847",
      icon: BriefcaseIcon,
      color: "text-success-600",
    },
    {
      name: "Monthly Revenue",
      value: "$127,420",
      icon: ChartBarIcon,
      color: "text-warning-600",
    },
    {
      name: "Conversion Rate",
      value: "12.3%",
      icon: CogIcon,
      color: "text-error-600",
    },
  ];

  return (
    <div className="">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Welcome back, {user?.user_metadata?.name || user?.email}! Here's
          what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-surface border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary truncate">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-text-primary">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="bg-surface border border-border rounded-lg shadow-sm">
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-6">
              <BriefcaseIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Welcome to your CRM!
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              You have successfully logged in. This is your central hub for
              managing customer relationships, tracking deals, and growing your
              business.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/contacts">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<UsersIcon className="h-5 w-5" />}
                >
                  Manage Contacts
                </Button>
              </Link>
              <Link to="/deals">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<BriefcaseIcon className="h-5 w-5" />}
                >
                  Manage Deals
                </Button>
              </Link>
            </div>

            {/* User Information Card */}
            <div className="bg-background-secondary border border-border rounded-lg p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-text-primary mb-4 text-center">
                User Information
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Email:</span>{" "}
                  {user?.email}
                </p>
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Name:</span>{" "}
                  {user?.user_metadata?.name || "Not provided"}
                </p>
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">
                    User ID:
                  </span>{" "}
                  {user?.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
