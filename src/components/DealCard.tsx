import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardBody, Button, Chip, Tooltip } from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { Deal } from "../types";

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  formatCurrency: (amount: number) => string;
  isDragging?: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onView,
  onDelete,
  formatCurrency,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardContent = (
    <Card
      className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-all ${
        isDragging || isSortableDragging ? "opacity-50 rotate-3 scale-105" : ""
      }`}
      style={style}
    >
      <CardBody className="p-4">
        <div className="space-y-3">
          {/* Deal Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {deal.title}
              </h4>
              <p className="text-lg font-bold text-green-600 mt-1">
                {formatCurrency(deal.monetary_value)}
              </p>
            </div>
            <div className="flex gap-1 ml-2">
              <Tooltip content="View details">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => onView(deal)}
                >
                  <EyeIcon className="w-3 h-3" />
                </Button>
              </Tooltip>
              <Tooltip content="Edit deal">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(deal)}
                >
                  <PencilIcon className="w-3 h-3" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete deal">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(deal)}
                >
                  <TrashIcon className="w-3 h-3" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Contact Information */}
          {deal.contact && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <UserIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{deal.contact.name}</span>
            </div>
          )}

          {/* Probability */}
          <div className="flex justify-between items-center">
            <Chip size="sm" variant="flat" color="default">
              {deal.probability_percentage}%
            </Chip>
            {deal.expected_close_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>
                  {new Date(deal.expected_close_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Created {new Date(deal.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (isDragging) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardContent}
    </div>
  );
};
