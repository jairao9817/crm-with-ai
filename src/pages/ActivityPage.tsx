import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui/Button";
import { DashboardService } from "../services/dashboardService";
import type { RecentActivity } from "../services/dashboardService";

const iconMap = {
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
};

const typeColors = {
  contact: "text-blue-600 bg-blue-100",
  deal: "text-green-600 bg-green-100",
  task: "text-purple-600 bg-purple-100",
  communication: "text-orange-600 bg-orange-100",
  purchase: "text-emerald-600 bg-emerald-100",
};

const typeLabels = {
  contact: "Contact",
  deal: "Deal",
  task: "Task",
  communication: "Communication",
  purchase: "Purchase",
};

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    RecentActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch more activities for the dedicated page
      const data = await DashboardService.getRecentActivity(100);
      setActivities(data);
      setFilteredActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((activity) => activity.type === selectedType);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (activity) => new Date(activity.date) >= filterDate
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (activity) => new Date(activity.date) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (activity) => new Date(activity.date) >= filterDate
          );
          break;
      }
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  }, [activities, selectedType, dateFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const getActivityLink = (activity: RecentActivity) => {
    switch (activity.type) {
      case "contact":
        return `/contacts/${activity.id}`;
      case "deal":
        return `/deals/${activity.id}`;
      case "task":
        return `/tasks`;
      case "communication":
        return `/communications`;
      case "purchase":
        return `/purchase-history`;
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              All Activity
            </h1>
            <p className="text-text-secondary mt-2">
              Complete history of all activities across your CRM
            </p>
          </div>
        </div>

        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              All Activity
            </h1>
            <p className="text-text-secondary mt-2">
              Complete history of all activities across your CRM
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Failed to Load Activities
          </h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={fetchActivities} variant="primary">
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
          <h1 className="text-3xl font-bold text-text-primary">All Activity</h1>
          <p className="text-text-secondary mt-2">
            Complete history of all activities across your CRM
          </p>
        </div>

        <Button
          onClick={fetchActivities}
          variant="secondary"
          size="sm"
          leftIcon={<ArrowPathIcon className="h-4 w-4" />}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="contact">Contacts</option>
              <option value="deal">Deals</option>
              <option value="task">Tasks</option>
              <option value="communication">Communications</option>
              <option value="purchase">Purchases</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4" />
            <span>
              Showing {filteredActivities.length} of {activities.length}{" "}
              activities
            </span>
          </div>
          {(selectedType !== "all" || dateFilter !== "all") && (
            <button
              onClick={() => {
                setSelectedType("all");
                setDateFilter("all");
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Activities List */}
      {currentActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No Activities Found
          </h3>
          <p className="text-text-secondary">
            {selectedType !== "all" || dateFilter !== "all"
              ? "Try adjusting your filters to see more activities."
              : "No activities have been recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentActivities.map((activity) => {
            const IconComponent =
              iconMap[activity.icon as keyof typeof iconMap] || CheckCircleIcon;
            const colorClasses = typeColors[activity.type];

            return (
              <div
                key={activity.id}
                className="bg-surface border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${colorClasses}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {typeLabels[activity.type]}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-text-primary mb-1">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-text-secondary mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center text-xs text-text-secondary">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatFullDate(activity.date)}
                        </div>
                      </div>

                      <Link
                        to={getActivityLink(activity)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-4"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredActivities.length)} of{" "}
            {filteredActivities.length} activities
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === pageNumber
                        ? "bg-primary-600 text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
