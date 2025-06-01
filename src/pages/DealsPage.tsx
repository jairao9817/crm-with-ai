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
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
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
          className="shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          Add Deal
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-error bg-error-50 dark:bg-error-950/20 border-2">
          <CardBody>
            <p className="text-error-600 dark:text-error-400">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="bg-surface border border-border shadow-md">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <Input
                placeholder="Search deals, contacts..."
                startContent={
                  <MagnifyingGlassIcon className="w-4 h-4 text-text-tertiary" />
                }
                value={searchTerm}
                onValueChange={handleSearchChange}
                className="w-full sm:w-80"
                classNames={{
                  input:
                    "bg-transparent text-text-primary placeholder:text-text-tertiary",
                  inputWrapper:
                    "bg-background-secondary border-border hover:border-border-focus",
                }}
              />
              <Select
                placeholder="Filter by stage"
                startContent={
                  <FunnelIcon className="w-4 h-4 text-text-tertiary" />
                }
                selectedKeys={filters.stage ? [filters.stage] : ["all"]}
                onSelectionChange={(keys) => {
                  const stage = Array.from(keys)[0] as string;
                  handleStageFilter(stage);
                }}
                className="w-full sm:w-48"
                classNames={{
                  trigger:
                    "bg-background-secondary border-border hover:border-border-focus",
                  value: "text-text-primary",
                }}
              >
                {[
                  <SelectItem key="all" className="text-text-primary">
                    All Stages
                  </SelectItem>,
                  ...(
                    Object.entries(stageConfig) as [
                      DealStage,
                      (typeof stageConfig)[DealStage]
                    ][]
                  ).map(([key, config]) => (
                    <SelectItem key={key} className="text-text-primary">
                      {config.label}
                    </SelectItem>
                  )),
                ]}
              </Select>
            </div>
            <div className="text-right bg-background-secondary rounded-lg p-3 border border-border">
              <p className="text-sm text-text-secondary">
                {filteredDeals.length} deal
                {filteredDeals.length !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Deals Table */}
      <Card className="bg-surface border border-border shadow-lg">
        <Table
          aria-label="Deals table"
          classNames={{
            wrapper: "bg-transparent",
            th: "bg-background-secondary text-text-primary border-b border-border",
            td: "border-b border-border/50",
          }}
        >
          <TableHeader>
            <TableColumn className="text-text-primary font-semibold">
              DEAL
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              CONTACT
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              STAGE
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              VALUE
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              PROBABILITY
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              CLOSE DATE
            </TableColumn>
            <TableColumn className="text-text-primary font-semibold">
              ACTIONS
            </TableColumn>
          </TableHeader>
          <TableBody emptyContent="No deals found">
            {filteredDeals.map((deal) => (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-background-secondary/50 transition-colors duration-150"
                onClick={() => handleView(deal)}
              >
                <TableCell>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {deal.title}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Created {new Date(deal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {deal.contact ? (
                    <div>
                      <p className="font-medium text-text-primary">
                        {deal.contact.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {deal.contact.email}
                      </p>
                      {deal.contact.company && (
                        <p className="text-sm text-text-tertiary">
                          {deal.contact.company}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-tertiary">No contact</span>
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
                      classNames={{
                        trigger:
                          "bg-background-secondary border-border hover:border-border-focus",
                        value: "text-text-primary",
                      }}
                    >
                      {(
                        Object.entries(stageConfig) as [
                          DealStage,
                          (typeof stageConfig)[DealStage]
                        ][]
                      ).map(([key, config]) => (
                        <SelectItem key={key} className="text-text-primary">
                          {config.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-success-600 dark:text-success-400">
                    {formatCurrency(deal.monetary_value)}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="default"
                    classNames={{
                      base: "bg-background-secondary border border-border",
                      content: "text-text-primary font-medium",
                    }}
                  >
                    {deal.probability_percentage}%
                  </Chip>
                </TableCell>
                <TableCell>
                  {deal.expected_close_date ? (
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <CalendarIcon className="w-4 h-4 text-text-tertiary" />
                      {new Date(deal.expected_close_date).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-text-tertiary">Not set</span>
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
                        className="text-text-secondary hover:text-text-primary hover:bg-background-secondary"
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
                        className="text-text-secondary hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20"
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
                        className="text-text-secondary hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-950/20"
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
      <Modal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        size="2xl"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-surface border border-border",
          header: "border-b border-border",
          body: "py-6",
          footer: "border-t border-border",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-text-primary">
            Create New Deal
          </ModalHeader>
          <ModalBody>
            <DealForm onSuccess={handleFormSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="2xl"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-surface border border-border",
          header: "border-b border-border",
          body: "py-6",
          footer: "border-t border-border",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-text-primary">Edit Deal</ModalHeader>
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
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-surface border border-border",
          header: "border-b border-border",
          body: "py-6",
          footer: "border-t border-border",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-text-primary">
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            <p className="text-text-secondary">
              Are you sure you want to delete{" "}
              <strong className="text-text-primary">
                {dealToDelete?.title}
              </strong>
              ? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsDeleteConfirmOpen(false)}
              className="text-text-secondary hover:text-text-primary hover:bg-background-secondary"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={confirmDelete}
              className="bg-error-500 hover:bg-error-600 text-white"
            >
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
