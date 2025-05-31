import React from "react";
import { Button } from "@heroui/react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <Button color="primary" startContent={actionIcon} onPress={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
};

export default PageHeader;
