import React from "react";
import { Button, Spinner } from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface DetailPageLayoutProps {
  loading: boolean;
  item: any;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  backLabel: string;
  children: React.ReactNode;
}

const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  loading,
  item,
  title,
  subtitle,
  onBack,
  onEdit,
  onDelete,
  backLabel,
  children,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title} not found
        </h2>
        <Button
          color="primary"
          onPress={onBack}
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
        >
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="light" isIconOnly onPress={onBack}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            variant="light"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={onEdit}
          >
            Edit
          </Button>
          <Button
            color="danger"
            variant="light"
            startContent={<TrashIcon className="w-4 h-4" />}
            onPress={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
};

export default DetailPageLayout;
