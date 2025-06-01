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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>
      <div className="flex-shrink-0">
        <Button
          color="primary"
          startContent={actionIcon}
          onPress={onAction}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-8"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
