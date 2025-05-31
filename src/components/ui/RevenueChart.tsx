import React from "react";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = Math.min(...data.map((d) => d.revenue));
  const range = maxRevenue - minRevenue;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Revenue Trends (Last 6 Months)
      </h3>

      {data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No revenue data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end justify-between h-48 space-x-2">
            {data.map((item, index) => {
              const height =
                maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    {/* Bar */}
                    <div className="w-full bg-gray-200 rounded-t relative group">
                      <div
                        className="bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 relative"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${item.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Month label */}
                    <div className="mt-2 text-xs text-text-secondary text-center">
                      {item.month}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-text-secondary">Total Revenue</p>
                <p className="font-semibold text-text-primary">
                  $
                  {data
                    .reduce((sum, item) => sum + item.revenue, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary">Average</p>
                <p className="font-semibold text-text-primary">
                  $
                  {Math.round(
                    data.reduce((sum, item) => sum + item.revenue, 0) /
                      data.length
                  ).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary">This Month</p>
                <p className="font-semibold text-text-primary">
                  ${data[data.length - 1]?.revenue.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
