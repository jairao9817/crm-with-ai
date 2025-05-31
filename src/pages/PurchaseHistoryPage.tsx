import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Badge,
  Progress,
} from "@heroui/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import type {
  PurchaseHistory,
  CreatePurchaseHistoryInput,
  UpdatePurchaseHistoryInput,
  PurchaseHistoryFilters,
  Contact,
  Deal,
  PurchaseStatus,
} from "../types";

interface PurchaseFormData {
  contact_id: string;
  deal_id?: string;
  date: string;
  amount: number;
  product_service: string;
  status: PurchaseStatus;
}

const PurchaseHistoryPage: React.FC = () => {
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseHistory | null>(null);
  const [filters, setFilters] = useState<PurchaseHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,
    refundedRevenue: 0,
    thisMonthRevenue: 0,
    purchaseCount: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>();

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm<PurchaseFormData>();

  const selectedContactId = watch("contact_id");
  const selectedEditContactId = watchEdit("contact_id");

  useEffect(() => {
    loadPurchases();
    loadContacts();
    loadDeals();
    loadRevenueStats();
  }, [filters]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await PurchaseHistoryService.getPurchaseHistory(filters);
      setPurchases(data);
    } catch (error) {
      console.error("Failed to load purchase history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await ContactService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  const loadDeals = async () => {
    try {
      const data = await DealService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error("Failed to load deals:", error);
    }
  };

  const loadRevenueStats = async () => {
    try {
      const stats = await PurchaseHistoryService.getRevenueStats();
      setRevenueStats(stats);
    } catch (error) {
      console.error("Failed to load revenue stats:", error);
    }
  };

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      setSubmitting(true);
      const purchaseData: CreatePurchaseHistoryInput = {
        contact_id: data.contact_id,
        deal_id: data.deal_id || undefined,
        date: data.date,
        amount: data.amount,
        product_service: data.product_service,
        status: data.status,
      };

      await PurchaseHistoryService.createPurchaseHistory(purchaseData);
      await loadPurchases();
      await loadRevenueStats();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create purchase record:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: PurchaseFormData) => {
    if (!selectedPurchase) return;

    try {
      setSubmitting(true);
      const purchaseData: UpdatePurchaseHistoryInput = {
        contact_id: data.contact_id,
        deal_id: data.deal_id || undefined,
        date: data.date,
        amount: data.amount,
        product_service: data.product_service,
        status: data.status,
      };

      await PurchaseHistoryService.updatePurchaseHistory(
        selectedPurchase.id,
        purchaseData
      );
      await loadPurchases();
      await loadRevenueStats();
      resetEdit();
      onEditClose();
      setSelectedPurchase(null);
    } catch (error) {
      console.error("Failed to update purchase record:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (purchase: PurchaseHistory) => {
    setSelectedPurchase(purchase);
    resetEdit({
      contact_id: purchase.contact_id,
      deal_id: purchase.deal_id || "",
      date: purchase.date,
      amount: purchase.amount,
      product_service: purchase.product_service,
      status: purchase.status,
    });
    onEditOpen();
  };

  const handleDelete = async (purchaseId: string) => {
    if (
      window.confirm("Are you sure you want to delete this purchase record?")
    ) {
      try {
        await PurchaseHistoryService.deletePurchaseHistory(purchaseId);
        await loadPurchases();
        await loadRevenueStats();
      } catch (error) {
        console.error("Failed to delete purchase record:", error);
      }
    }
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "refunded":
        return <ArrowPathIcon className="w-4 h-4" />;
      case "cancelled":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShoppingCartIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getContactDeals = (contactId: string) => {
    return deals.filter((deal) => deal.contact_id === contactId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const purchasesByStatus = purchases.reduce((acc, purchase) => {
    acc[purchase.status] = (acc[purchase.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completionRate =
    revenueStats.purchaseCount > 0
      ? ((purchasesByStatus.completed || 0) / revenueStats.purchaseCount) * 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Purchase History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track customer purchases and revenue
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onOpen}
        >
          Add Purchase
        </Button>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueStats.totalRevenue)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(revenueStats.thisMonthRevenue)}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Purchases
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {revenueStats.purchaseCount}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShoppingCartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <Progress
              value={completionRate}
              className="mt-2"
              color="success"
              size="sm"
            />
          </CardBody>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed Revenue
              </span>
              <CheckCircleIcon className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">
              {formatCurrency(revenueStats.completedRevenue)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Revenue
              </span>
              <ClockIcon className="w-5 h-5 text-warning" />
            </div>
            <p className="text-xl font-bold text-warning">
              {formatCurrency(revenueStats.pendingRevenue)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Refunded Revenue
              </span>
              <ArrowPathIcon className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-xl font-bold text-secondary">
              {formatCurrency(revenueStats.refundedRevenue)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search purchases..."
              startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1"
            />
            <Button
              variant={showFilters ? "solid" : "bordered"}
              startContent={<FunnelIcon className="w-4 h-4" />}
              onPress={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Select
                label="Status"
                placeholder="All statuses"
                selectedKeys={filters.status ? [filters.status] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    status: Array.from(keys)[0] as PurchaseStatus,
                  })
                }
              >
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="refunded">Refunded</SelectItem>
                <SelectItem key="cancelled">Cancelled</SelectItem>
              </Select>

              <Select
                label="Contact"
                placeholder="All contacts"
                selectedKeys={filters.contact_id ? [filters.contact_id] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    contact_id: Array.from(keys)[0] as string,
                  })
                }
              >
                {contacts.map((contact) => (
                  <SelectItem key={contact.id}>{contact.name}</SelectItem>
                ))}
              </Select>

              <Input
                type="date"
                label="From Date"
                value={filters.date_from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
              />

              <Input
                type="date"
                label="To Date"
                value={filters.date_to || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Purchase History List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {purchase.product_service}
                      </h3>
                      <Chip
                        color={getStatusColor(purchase.status)}
                        variant="flat"
                        size="sm"
                        startContent={getStatusIcon(purchase.status)}
                      >
                        {purchase.status}
                      </Chip>
                      <Chip variant="bordered" size="sm" color="success">
                        {formatCurrency(purchase.amount)}
                      </Chip>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Contact: {purchase.contact?.name} (
                        {purchase.contact?.email})
                      </span>
                      {purchase.deal && (
                        <Badge
                          content={purchase.deal.stage}
                          color="primary"
                          variant="flat"
                        >
                          <span>Deal: {purchase.deal.title}</span>
                        </Badge>
                      )}
                      <span>Date: {formatDate(purchase.date)}</span>
                    </div>
                  </div>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        onPress={() => handleEdit(purchase)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onPress={() => handleDelete(purchase.id)}
                        className="text-danger"
                        color="danger"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          ))}

          {purchases.length === 0 && (
            <Card>
              <CardBody className="p-12 text-center">
                <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  No purchase history found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start tracking customer purchases to analyze revenue.
                </p>
                <Button color="primary" onPress={onOpen}>
                  Add Purchase
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Create Purchase Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Add New Purchase</ModalHeader>
            <ModalBody className="space-y-4">
              <Controller
                name="contact_id"
                control={control}
                rules={{ required: "Contact is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Contact"
                    placeholder="Select a contact"
                    isInvalid={!!errors.contact_id}
                    errorMessage={errors.contact_id?.message}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="product_service"
                control={control}
                rules={{ required: "Product/Service is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Product/Service"
                    placeholder="Enter product or service name"
                    isInvalid={!!errors.product_service}
                    errorMessage={errors.product_service?.message}
                  />
                )}
              />

              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be positive" },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Amount"
                    placeholder="Enter purchase amount"
                    startContent="$"
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                    value={field.value?.toString() || ""}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />

              <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Purchase Date"
                    isInvalid={!!errors.date}
                    errorMessage={errors.date?.message}
                  />
                )}
              />

              <Controller
                name="deal_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Deal (Optional)"
                    placeholder="Select a deal"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    {getContactDeals(selectedContactId).map((deal) => (
                      <SelectItem key={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Select status"
                    isInvalid={!!errors.status}
                    errorMessage={errors.status?.message}
                    selectedKeys={field.value ? [field.value] : ["completed"]}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as PurchaseStatus)
                    }
                  >
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
                    <SelectItem key="cancelled">Cancelled</SelectItem>
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Add Purchase
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleEditSubmit(onEditSubmit)}>
            <ModalHeader>Edit Purchase</ModalHeader>
            <ModalBody className="space-y-4">
              <Controller
                name="contact_id"
                control={editControl}
                rules={{ required: "Contact is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Contact"
                    placeholder="Select a contact"
                    isInvalid={!!editErrors.contact_id}
                    errorMessage={editErrors.contact_id?.message}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="product_service"
                control={editControl}
                rules={{ required: "Product/Service is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Product/Service"
                    placeholder="Enter product or service name"
                    isInvalid={!!editErrors.product_service}
                    errorMessage={editErrors.product_service?.message}
                  />
                )}
              />

              <Controller
                name="amount"
                control={editControl}
                rules={{
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be positive" },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    label="Amount"
                    placeholder="Enter purchase amount"
                    startContent="$"
                    isInvalid={!!editErrors.amount}
                    errorMessage={editErrors.amount?.message}
                    value={field.value?.toString() || ""}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />

              <Controller
                name="date"
                control={editControl}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Purchase Date"
                    isInvalid={!!editErrors.date}
                    errorMessage={editErrors.date?.message}
                  />
                )}
              />

              <Controller
                name="deal_id"
                control={editControl}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Deal (Optional)"
                    placeholder="Select a deal"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as string)
                    }
                  >
                    {getContactDeals(selectedEditContactId).map((deal) => (
                      <SelectItem key={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="status"
                control={editControl}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Select status"
                    isInvalid={!!editErrors.status}
                    errorMessage={editErrors.status?.message}
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as PurchaseStatus)
                    }
                  >
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
                    <SelectItem key="cancelled">Cancelled</SelectItem>
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Update Purchase
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PurchaseHistoryPage;
