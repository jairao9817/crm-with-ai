import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useDeals } from "../hooks/useDeals";
import { DealForm } from "../components/DealForm";
import { DealCloseModal } from "../components/DealCloseModal";
import type { Deal, DealStage, DealFilters } from "../types";

const stageConfig: Record<
  DealStage,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
  }
> = {
  lead: { label: "Lead", color: "default" },
  prospect: { label: "Prospect", color: "primary" },
  negotiation: { label: "Negotiation", color: "warning" },
  "closed-won": { label: "Closed Won", color: "success" },
  "closed-lost": { label: "Closed Lost", color: "danger" },
};

const DealsPage: React.FC = () => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [dealToClose, setDealToClose] = useState<Deal | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  const { deals, loading, error, updateDeal, deleteDeal, refresh } =
    useDeals(filters);

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
    isOpen: isCloseModalOpen,
    onOpen: onCloseModalOpen,
    onClose: onCloseModalClose,
  } = useDisclosure();

  const navigate = useNavigate();

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    onEditOpen();
  };

  const handleView = (deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  };

  const handleDelete = (deal: Deal) => {
    setDealToDelete(deal);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (dealToDelete) {
      try {
        await deleteDeal(dealToDelete.id);
        setIsDeleteConfirmOpen(false);
        setDealToDelete(null);
      } catch (error) {
        console.error("Failed to delete deal:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    onCreateClose();
    onEditClose();
    setSelectedDeal(null);
    refresh();
  };

  const handleCloseSuccess = () => {
    setDealToClose(null);
    onCloseModalClose();
    refresh();
  };

  const handleStageChange = async (deal: Deal, newStage: DealStage) => {
    try {
      // If closing as won and deal has contact and value, show modal for purchase creation
      if (
        newStage === "closed-won" &&
        deal.stage !== "closed-won" &&
        deal.contact_id &&
        deal.monetary_value > 0
      ) {
        setDealToClose(deal);
        onCloseModalOpen();
        return;
      }

      // Otherwise, update directly
      await updateDeal(deal.id, { stage: newStage });
    } catch (error) {
      console.error("Failed to update deal stage:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleStageFilter = (stage: string) => {
    setFilters((prev) => ({
      ...prev,
      stage: stage === "all" ? undefined : (stage as DealStage),
    }));
  };

  const filteredDeals = deals.filter((deal) => {
    if (
      searchTerm &&
      !deal.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !deal.contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !deal.contact?.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalValue = filteredDeals.reduce(
    (sum, deal) => sum + (deal.monetary_value || 0),
    0
  );

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
          <h1 className="text-3xl font-bold text-text-primary">Deals</h1>
          <p className="text-text-secondary mt-2">
            Manage your sales deals and track progress
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
        <Card className="border-error bg-error-50">
          <CardBody>
            <p className="text-error-600">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <Input
                placeholder="Search deals, contacts..."
                startContent={
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                }
                value={searchTerm}
                onValueChange={handleSearchChange}
                className="w-full sm:w-80"
              />
              <Select
                placeholder="Filter by stage"
                startContent={<FunnelIcon className="w-4 h-4" />}
                selectedKeys={filters.stage ? [filters.stage] : ["all"]}
                onSelectionChange={(keys) => {
                  const stage = Array.from(keys)[0] as string;
                  handleStageFilter(stage);
                }}
                className="w-full sm:w-48"
              >
                {[
                  <SelectItem key="all">All Stages</SelectItem>,
                  ...(
                    Object.entries(stageConfig) as [
                      DealStage,
                      (typeof stageConfig)[DealStage]
                    ][]
                  ).map(([key, config]) => (
                    <SelectItem key={key}>{config.label}</SelectItem>
                  )),
                ]}
              </Select>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {filteredDeals.length} deal
                {filteredDeals.length !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Deals Table */}
      <Card>
        <Table aria-label="Deals table">
          <TableHeader>
            <TableColumn>DEAL</TableColumn>
            <TableColumn>CONTACT</TableColumn>
            <TableColumn>STAGE</TableColumn>
            <TableColumn>VALUE</TableColumn>
            <TableColumn>PROBABILITY</TableColumn>
            <TableColumn>CLOSE DATE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No deals found">
            {filteredDeals.map((deal) => (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleView(deal)}
              >
                <TableCell>
                  <div>
                    <p className="font-semibold text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(deal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {deal.contact ? (
                    <div>
                      <p className="font-medium text-gray-900">
                        {deal.contact.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deal.contact.email}
                      </p>
                      {deal.contact.company && (
                        <p className="text-sm text-gray-500">
                          {deal.contact.company}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No contact</span>
                  )}
                </TableCell>
                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      selectedKeys={[deal.stage]}
                      onSelectionChange={(keys) => {
                        const newStage = Array.from(keys)[0] as DealStage;
                        if (newStage !== deal.stage) {
                          handleStageChange(deal, newStage);
                        }
                      }}
                      className="w-40"
                      size="sm"
                    >
                      {(
                        Object.entries(stageConfig) as [
                          DealStage,
                          (typeof stageConfig)[DealStage]
                        ][]
                      ).map(([key, config]) => (
                        <SelectItem key={key}>{config.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(deal.monetary_value)}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="default">
                    {deal.probability_percentage}%
                  </Chip>
                </TableCell>
                <TableCell>
                  {deal.expected_close_date ? (
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {new Date(deal.expected_close_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className="flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip content="View details">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleView(deal)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit deal">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(deal)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete deal">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(deal)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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

      {/* Deal Close Modal */}
      {dealToClose && (
        <DealCloseModal
          isOpen={isCloseModalOpen}
          onClose={onCloseModalClose}
          deal={dealToClose}
          onSuccess={handleCloseSuccess}
        />
      )}
    </div>
  );
};

export default DealsPage;
