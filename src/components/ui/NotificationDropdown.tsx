import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BellIcon,
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/24/solid";
import { DashboardService } from "../../services/dashboardService";
import type { RecentActivity } from "../../services/dashboardService";

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

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getRecentActivity(8);
      setActivities(data);
      // For demo purposes, assume all activities are unread
      setUnreadCount(data.length);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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
      return date.toLocaleDateString();
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAsRead();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="h-6 w-6" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                  Recent Activity
                </h3>
                <Link
                  to="/activity"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View all
                </Link>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-6 text-center">
                  <BellIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-text-secondary">
                    No recent activity
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {activities.map((activity, index) => {
                    const IconComponent =
                      iconMap[activity.icon as keyof typeof iconMap] ||
                      CheckCircleIcon;
                    const colorClasses = typeColors[activity.type];

                    return (
                      <div
                        key={activity.id}
                        className="px-4 py-3 hover:bg-background-secondary transition-colors cursor-pointer border-b border-border last:border-b-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClasses}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-text-secondary mt-1">
                              {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {activities.length > 0 && (
              <div className="px-4 py-3 border-t border-border bg-background-secondary">
                <Link
                  to="/activity"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
