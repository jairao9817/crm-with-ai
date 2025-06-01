import React from "react";
import { Card, CardBody } from "@heroui/react";

export interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  iconBgColor?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, columns = 4 }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="shadow-lg hover:shadow-xl transition-all duration-300 border border-border bg-surface group hover:scale-105"
        >
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                  {stat.label}
                </p>
                <p
                  className={`text-3xl font-bold transition-colors duration-200 ${
                    stat.color || "text-text-primary"
                  } group-hover:scale-105`}
                >
                  {typeof stat.value === "number" && stat.value >= 1000
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
              <div
                className={`
                  p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110
                  ${stat.iconBgColor || "bg-primary-100 dark:bg-primary-900/20"}
                `}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
