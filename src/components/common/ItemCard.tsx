import React from "react";
import { CardBody, Chip, Avatar } from "@heroui/react";

interface MetadataItem {
  label: string;
  value: string;
}

interface ItemCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  chipLabel?: string;
  chipColor?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  chipIcon?: React.ReactNode;
  avatarColor?: string;
  metadata: MetadataItem[];
  content?: string;
  topContent?: React.ReactNode;
}

const ItemCard: React.FC<ItemCardProps> = ({
  title,
  subtitle,
  icon,
  chipLabel,
  chipColor = "default",
  chipIcon,
  avatarColor,
  metadata,
  content,
  topContent,
}) => {
  return (
    <CardBody className="p-6">
      {/* Top content (e.g., status badge, price) */}
      {topContent}

      {/* Header with icon/avatar and title */}
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <Avatar
            icon={icon}
            className={avatarColor || "bg-primary-100 text-primary"}
            size="sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {chipLabel && (
            <Chip
              color={chipColor}
              variant="flat"
              size="sm"
              startContent={chipIcon}
              className="mt-1"
            >
              {chipLabel}
            </Chip>
          )}
        </div>
      </div>

      {/* Metadata */}
      {metadata.length > 0 && (
        <div className="space-y-2">
          {metadata.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <span className="font-medium">{item.label}:</span>
              <span className="truncate">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {content && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 line-clamp-2">
          {content}
        </p>
      )}
    </CardBody>
  );
};

export default ItemCard;
