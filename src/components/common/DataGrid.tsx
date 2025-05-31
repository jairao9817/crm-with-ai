import React from "react";
import { Card, CardBody, Spinner, Button } from "@heroui/react";

interface DataGridProps<T> {
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
  columns?: number;
  itemKey?: keyof T | ((item: T) => string);
}

const DataGrid = <T extends Record<string, any>>({
  items,
  loading,
  renderItem,
  onItemClick,
  emptyState,
  columns = 3,
  itemKey = "id",
}: DataGridProps<T>) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  };

  const getItemKey = (item: T, index: number): string => {
    if (typeof itemKey === "function") {
      return itemKey(item);
    }
    return item[itemKey] || index.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return (
      <Card>
        <CardBody className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 text-gray-400">
            {emptyState.icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            {emptyState.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {emptyState.description}
          </p>
          {emptyState.actionLabel && emptyState.onAction && (
            <Button color="primary" onPress={emptyState.onAction}>
              {emptyState.actionLabel}
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {items.map((item, index) => (
        <Card
          key={getItemKey(item, index)}
          className={
            onItemClick
              ? "hover:shadow-md transition-shadow cursor-pointer"
              : ""
          }
          isPressable={!!onItemClick}
          onPress={onItemClick ? () => onItemClick(item) : undefined}
        >
          {renderItem(item)}
        </Card>
      ))}
    </div>
  );
};

export default DataGrid;
