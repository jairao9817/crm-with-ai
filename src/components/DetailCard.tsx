import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

interface DetailItem {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

interface DetailCardProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  items: DetailItem[];
  content?: React.ReactNode;
  columns?: 1 | 2 | 3;
}

const DetailCard: React.FC<DetailCardProps> = ({
  title,
  icon,
  iconBgColor,
  items,
  content,
  columns = 2,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>{icon}</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </CardHeader>
      <CardBody className="pt-6">
        {content && <div className="mb-6">{content}</div>}
        <div className="space-y-6">
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
            {items.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white pl-6">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DetailCard;
