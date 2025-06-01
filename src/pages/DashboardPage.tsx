import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { MetricCard, PipelineOverview, RevenueChart } from "../components/ui";
import { useDashboard } from "../hooks/useDashboard";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    metrics,
    pipelineOverview,
    revenueTrends,
    loading,
    error,
    refreshDashboard,
  } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={refreshDashboard} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-2">
            Welcome back, {user?.user_metadata?.name || user?.email}! Here's
            your business overview.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={refreshDashboard}
            variant="secondary"
            size="sm"
            leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            disabled={Object.values(loading).some(Boolean)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Contacts"
          value={metrics?.totalContacts || 0}
          icon={UserIcon}
          color="text-blue-600"
          loading={loading.metrics}
        />
        <MetricCard
          title="Active Deals"
          value={metrics?.activeDeals || 0}
          icon={BriefcaseIcon}
          color="text-green-600"
          subtitle="Excluding closed deals"
          loading={loading.metrics}
        />
        <MetricCard
          title="This Month Revenue"
          value={`$${metrics?.thisMonthRevenue?.toLocaleString() || "0"}`}
          icon={CurrencyDollarIcon}
          color="text-emerald-600"
          loading={loading.metrics}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          icon={ChartBarIcon}
          color="text-purple-600"
          subtitle="Won deals / Total closed"
          loading={loading.metrics}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/contacts">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Contact
            </Button>
          </Link>
          <Link to="/deals">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Add Deal
            </Button>
          </Link>
          <Link to="/communications">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Log Communication
            </Button>
          </Link>
          <Link to="/tasks">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Create Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Pipeline Overview - Now takes full width */}
      <PipelineOverview
        data={
          pipelineOverview || {
            lead: { count: 0, value: 0 },
            prospect: { count: 0, value: 0 },
            negotiation: { count: 0, value: 0 },
            "closed-won": { count: 0, value: 0 },
            "closed-lost": { count: 0, value: 0 },
          }
        }
        loading={loading.pipeline}
      />

      {/* Revenue Chart */}
      <RevenueChart data={revenueTrends} loading={loading.revenue} />

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Pipeline Value
          </h4>
          <p className="text-2xl font-semibold text-text-primary">
            ${metrics?.pipelineValue?.toLocaleString() || "0"}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Active deals total value
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Deals Won This Month
          </h4>
          <p className="text-2xl font-semibold text-green-600">
            {metrics?.wonDealsThisMonth || 0}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Successfully closed deals
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Total Communications
          </h4>
          <p className="text-2xl font-semibold text-text-primary">
            {metrics?.totalCommunications || 0}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            All logged interactions
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-primary-700 font-medium">Total Revenue</p>
            <p className="text-xl font-bold text-primary-900">
              ${metrics?.totalRevenue?.toLocaleString() || "0"}
            </p>
          </div>
          <div>
            <p className="text-primary-700 font-medium">Completed Tasks</p>
            <p className="text-xl font-bold text-primary-900">
              {metrics?.completedTasks || 0}
            </p>
          </div>
          <div>
            <p className="text-primary-700 font-medium">Overdue Tasks</p>
            <p className="text-xl font-bold text-red-600">
              {metrics?.overdueTasks || 0}
            </p>
          </div>
          <div>
            <p className="text-primary-700 font-medium">
              Lost Deals This Month
            </p>
            <p className="text-xl font-bold text-red-600">
              {metrics?.lostDealsThisMonth || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
