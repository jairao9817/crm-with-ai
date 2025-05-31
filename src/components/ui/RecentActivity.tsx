import React from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { RecentActivity as ActivityData } from "../../services/dashboardService";

interface RecentActivityProps {
  activities: ActivityData[];
  loading?: boolean;
}

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

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-text-secondary">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent =
              iconMap[activity.icon as keyof typeof iconMap] || CheckCircleIcon;
            const colorClasses = typeColors[activity.type];

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClasses}`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {activity.description}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatDate(activity.date)}
                  </p>
                </div>

                {index < activities.length - 1 && (
                  <div className="absolute left-7 mt-8 h-6 w-px bg-border"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Link
            to="/activity"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
