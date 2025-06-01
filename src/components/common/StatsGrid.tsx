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
        <Card key={index}>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    stat.color || "text-text-primary"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${
                  stat.iconBgColor || "bg-primary-100"
                }`}
              >
                {stat.icon}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
