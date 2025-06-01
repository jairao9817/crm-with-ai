import React from "react";
import { Card, CardBody, Spinner, Button } from "@heroui/react";

interface DataListProps<T> {
  items: T[];
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  itemKey?: keyof T | ((item: T) => string);
}

const DataList = <T extends Record<string, any>>({
  items,
  loading,
  renderItem,
  onItemClick,
  emptyState,
  itemKey = "id",
}: DataListProps<T>) => {
  const getItemKey = (item: T, index: number): string => {
    if (typeof itemKey === "function") {
      return itemKey(item);
    }
    return item[itemKey] || index.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="primary" />
          <p className="text-text-secondary text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return (
      <Card className="shadow-sm border border-border">
        <CardBody className="p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 text-text-tertiary flex items-center justify-center">
            {emptyState.icon}
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            {emptyState.title}
          </h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
            {emptyState.description}
          </p>
          {emptyState.actionLabel && emptyState.onAction && (
            <Button
              color="primary"
              size="lg"
              onPress={emptyState.onAction}
              className="shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              {emptyState.actionLabel}
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border border-border shadow-lg">
      <CardBody className="p-0">
        <div className="divide-y divide-border/60">
          {items.map((item, index) => (
            <div
              key={getItemKey(item, index)}
              className={`
                relative px-6 py-5 transition-all duration-200 ease-in-out
                ${
                  onItemClick
                    ? "hover:bg-background-secondary/80 cursor-pointer hover:shadow-sm active:bg-background-secondary"
                    : ""
                }
                ${index === 0 ? "rounded-t-lg" : ""}
                ${index === items.length - 1 ? "rounded-b-lg" : ""}
              `}
              onClick={onItemClick ? () => onItemClick(item) : undefined}
            >
              {/* Subtle left border accent on hover */}
              {onItemClick && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 hover:opacity-100 transition-opacity duration-200" />
              )}

              <div className="relative">{renderItem(item)}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default DataList;
