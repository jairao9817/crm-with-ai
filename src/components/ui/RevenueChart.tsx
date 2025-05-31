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

  // Ensure we have unique months and sort them chronologically
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Remove duplicates by month name and keep the latest entry
    const uniqueData = data.reduce((acc, item) => {
      const existingIndex = acc.findIndex(
        (existing) => existing.month === item.month
      );
      if (existingIndex >= 0) {
        // If month already exists, sum the revenue
        acc[existingIndex].revenue += item.revenue;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as Array<{ month: string; revenue: number }>);

    // Sort chronologically (assuming format like "Jan 2024", "Feb 2024", etc.)
    return uniqueData.sort((a, b) => {
      const dateA = new Date(a.month + " 01");
      const dateB = new Date(b.month + " 01");
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);

  const maxRevenue = Math.max(...processedData.map((d) => d.revenue), 0);

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Revenue Trends (Last 6 Months)
      </h3>

      {processedData.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No revenue data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative h-48">
            <div className="flex items-end justify-between h-full space-x-2">
              {processedData.map((item, index) => {
                const height =
                  maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                return (
                  <div
                    key={`${item.month}-${index}`}
                    className="flex-1 flex flex-col items-center h-full"
                  >
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      {/* Bar */}
                      <div className="w-full relative group flex flex-col justify-end h-full">
                        <div
                          className="bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600 relative min-h-[2px] w-full"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ${item.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Month labels */}
            <div className="flex justify-between mt-2">
              {processedData.map((item, index) => (
                <div
                  key={`label-${item.month}-${index}`}
                  className="flex-1 text-center"
                >
                  <div className="text-xs text-text-secondary">
                    {item.month}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-text-secondary">Total Revenue</p>
                <p className="font-semibold text-text-primary">
                  $
                  {processedData
                    .reduce((sum, item) => sum + item.revenue, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary">Average</p>
                <p className="font-semibold text-text-primary">
                  $
                  {processedData.length > 0
                    ? Math.round(
                        processedData.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / processedData.length
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary">This Month</p>
                <p className="font-semibold text-text-primary">
                  $
                  {processedData[
                    processedData.length - 1
                  ]?.revenue.toLocaleString() || "0"}
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
