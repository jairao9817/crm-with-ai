import React from "react";
import type { PipelineData } from "../../services/dashboardService";

interface PipelineOverviewProps {
  data: PipelineData;
  loading?: boolean;
}

const stageConfig = {
  lead: { label: "Lead", color: "bg-blue-500" },
  prospect: { label: "Prospect", color: "bg-yellow-500" },
  negotiation: { label: "Negotiation", color: "bg-orange-500" },
  "closed-won": { label: "Closed Won", color: "bg-green-500" },
  "closed-lost": { label: "Closed Lost", color: "bg-red-500" },
};

const PipelineOverview: React.FC<PipelineOverviewProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate max value for scaling bars
  const maxValue = Math.max(
    ...Object.values(data).map((stage) => stage.value || 0)
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Pipeline Overview
      </h3>

      <div className="space-y-4">
        {Object.entries(data).map(([stageKey, stageData]) => {
          const config = stageConfig[stageKey as keyof typeof stageConfig];
          const percentage =
            maxValue > 0 ? ((stageData.value || 0) / maxValue) * 100 : 0;

          return (
            <div key={stageKey} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">
                  {config.label}
                </span>
                <span className="text-sm text-text-secondary">
                  {stageData.count} deals
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${config.color} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span>${stageData.value?.toLocaleString() || "0"}</span>
                <span>{percentage.toFixed(1)}% of pipeline value</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-text-primary">
            Total Pipeline Value:
          </span>
          <span className="font-semibold text-text-primary">
            $
            {Object.values(data)
              .reduce((sum, stage) => sum + (stage.value || 0), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PipelineOverview;
