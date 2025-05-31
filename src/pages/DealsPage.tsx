import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Tooltip,
} from "@heroui/react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useDealsPipeline } from "../hooks/useDeals";
import { DealForm } from "../components/DealForm";
import { DealCard } from "../components/DealCard";
import type { Deal, DealStage } from "../types";

const stageConfig: Record<
  DealStage,
  { label: string; color: string; bgColor: string }
> = {
  lead: { label: "Lead", color: "text-gray-700", bgColor: "bg-gray-50" },
  prospect: {
    label: "Prospect",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  negotiation: {
    label: "Negotiation",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
  },
  "closed-won": {
    label: "Closed Won",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  "closed-lost": {
    label: "Closed Lost",
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
};

const DroppableStage: React.FC<{
  stage: DealStage;
  config: { label: string; color: string; bgColor: string };
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  formatCurrency: (amount: number) => string;
  getTotalValue: (deals: Deal[]) => number;
}> = ({
  stage,
  config,
  deals,
  onEdit,
  onView,
  onDelete,
  formatCurrency,
  getTotalValue,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <Card
      ref={setNodeRef}
      className={`${config.bgColor} border-2 border-dashed ${
        isOver ? "border-blue-400 bg-blue-100" : "border-gray-200"
      } min-h-[500px] transition-all`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center w-full">
          <div>
            <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
            <p className="text-sm text-gray-500">
              {deals.length} deal{deals.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(getTotalValue(deals))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onEdit={onEdit}
                onView={onView}
                onDelete={onDelete}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </SortableContext>
      </CardBody>
    </Card>
  );
};

const DealsPage: React.FC = () => {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { pipeline, loading, error, updateDealStage, refresh } =
    useDealsPipeline();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dealId = active.id as string;

    // Find the deal being dragged
    for (const stage of Object.keys(pipeline) as DealStage[]) {
      const deal = pipeline[stage].find((d) => d.id === dealId);
      if (deal) {
        setActiveDeal(deal);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveDeal(null);
      return;
    }

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    // Find the current stage of the deal
    let currentStage: DealStage | null = null;
    for (const stage of Object.keys(pipeline) as DealStage[]) {
      if (pipeline[stage].some((d) => d.id === dealId)) {
        currentStage = stage;
        break;
      }
    }

    if (currentStage && currentStage !== newStage) {
      try {
        await updateDealStage(dealId, newStage, currentStage);
      } catch (error) {
        console.error("Failed to update deal stage:", error);
      }
    }

    setActiveDeal(null);
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    onEditOpen();
  };

  const handleView = (deal: Deal) => {
    setSelectedDeal(deal);
    onViewOpen();
  };

  const handleDelete = (deal: Deal) => {
    setDealToDelete(deal);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    // This would use the deleteDeal function from useDeals hook
    // For now, we'll just close the modal
    setIsDeleteConfirmOpen(false);
    setDealToDelete(null);
    refresh();
  };

  const handleFormSuccess = () => {
    onCreateClose();
    onEditClose();
    setSelectedDeal(null);
    refresh();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalValue = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => sum + (deal.monetary_value || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
          <p className="text-gray-600">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onCreateOpen}
        >
          Add Deal
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-danger">
          <CardBody>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Pipeline */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {(Object.keys(stageConfig) as DealStage[]).map((stage) => {
            const stageDeals = pipeline[stage] || [];
            const config = stageConfig[stage];

            return (
              <DroppableStage
                key={stage}
                stage={stage}
                config={config}
                deals={stageDeals}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                formatCurrency={formatCurrency}
                getTotalValue={getTotalValue}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCard
              deal={activeDeal}
              onEdit={() => {}}
              onView={() => {}}
              onDelete={() => {}}
              formatCurrency={formatCurrency}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Deal Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalContent>
          <ModalHeader>Create New Deal</ModalHeader>
          <ModalBody>
            <DealForm onSuccess={handleFormSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Deal</ModalHeader>
          <ModalBody>
            {selectedDeal && (
              <DealForm deal={selectedDeal} onSuccess={handleFormSuccess} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Deal Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="3xl">
        <ModalContent>
          <ModalHeader>Deal Details</ModalHeader>
          <ModalBody>
            {selectedDeal && (
              <div className="space-y-6">
                {/* Deal Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedDeal.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip
                        color={stageConfig[selectedDeal.stage].color as any}
                        variant="flat"
                      >
                        {stageConfig[selectedDeal.stage].label}
                      </Chip>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedDeal.monetary_value)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<PencilIcon className="w-4 h-4" />}
                      onPress={() => {
                        onViewClose();
                        handleEdit(selectedDeal);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Deal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Contact Information
                      </h3>
                      {selectedDeal.contact ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <UserIcon className="w-4 h-4 inline mr-2" />
                            {selectedDeal.contact.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedDeal.contact.email}
                          </p>
                          {selectedDeal.contact.company && (
                            <p className="text-sm text-gray-600">
                              {selectedDeal.contact.company}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No contact associated
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Deal Value
                      </h3>
                      <p className="text-sm text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                        {formatCurrency(selectedDeal.monetary_value)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Probability
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedDeal.probability_percentage}%
                      </p>
                    </div>

                    {selectedDeal.expected_close_date && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Expected Close Date
                        </h3>
                        <p className="text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4 inline mr-2" />
                          {new Date(
                            selectedDeal.expected_close_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Created
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedDeal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{dealToDelete?.title}</strong>? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DealsPage;
