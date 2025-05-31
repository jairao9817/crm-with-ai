import React from "react";
import { Card, CardBody, Chip, Avatar, Badge, Button } from "@heroui/react";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

interface HeroSectionProps {
  title: string;
  status?: {
    value: string;
    color:
      | "success"
      | "warning"
      | "danger"
      | "primary"
      | "secondary"
      | "default";
    icon: React.ReactNode;
  };
  date?: {
    label: string;
    value: string;
  };
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  gradient: string;
  avatar: {
    icon: React.ReactNode;
    className: string;
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  status,
  date,
  description,
  children,
  actions,
  gradient,
  avatar,
}) => {
  return (
    <Card className={`mb-8 border-none shadow-lg ${gradient}`}>
      <CardBody className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <Avatar
                icon={avatar.icon}
                className={`w-16 h-16 ${avatar.className} text-large`}
              />
              {status && (
                <Badge
                  color={status.color}
                  className="absolute -top-1 -right-1"
                  size="lg"
                >
                  •
                </Badge>
              )}
            </div>
            <div className="space-y-3 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                {status && (
                  <Chip
                    color={status.color}
                    variant="solid"
                    size="lg"
                    startContent={status.icon}
                    className="font-semibold"
                  >
                    {status.value.toUpperCase()}
                  </Chip>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {date.label}: {date.value}
                    </span>
                  </div>
                )}
              </div>
              {description && (
                <div className="max-w-2xl">
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {description}
                  </p>
                </div>
              )}
              {children}
            </div>
          </div>
          {actions && <div className="flex flex-col gap-3">{actions}</div>}
        </div>
      </CardBody>
    </Card>
  );
};

export default HeroSection;
