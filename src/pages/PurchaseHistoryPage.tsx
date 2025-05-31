import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Spinner,
  Progress,
} from "@heroui/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>();

  const selectedContactId = watch("contact_id");

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

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "refunded":
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

  const handlePurchaseClick = (purchaseId: string) => {
    navigate(`/purchase-history/${purchaseId}`);
  };

  return (
    <div className="space-y-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <CurrencyDollarIcon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(revenueStats.totalRevenue)}
            </p>
          </CardBody>
        </Card>

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

      {/* Purchase History Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              isPressable
              onPress={() => handlePurchaseClick(purchase.id)}
            >
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <ShoppingCartIcon className="w-5 h-5 text-primary" />
                  </div>
                  <Chip
                    color={getStatusColor(purchase.status)}
                    variant="flat"
                    size="sm"
                    startContent={getStatusIcon(purchase.status)}
                  >
                    {purchase.status}
                  </Chip>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {purchase.product_service}
                    </h3>
                    <p className="text-2xl font-bold text-success mt-1">
                      {formatCurrency(purchase.amount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Customer:</span>
                      <span className="truncate">{purchase.contact?.name}</span>
                    </div>

                    {purchase.deal && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Deal:</span>
                        <span className="truncate">{purchase.deal.title}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Date:</span>
                      <span>{formatDate(purchase.date)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {purchases.length === 0 && (
            <div className="col-span-full">
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
            </div>
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
                    placeholder="0.00"
                    startContent="$"
                    isInvalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
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
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) =>
                      field.onChange(Array.from(keys)[0] as PurchaseStatus)
                    }
                  >
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
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
    </div>
  );
};

export default PurchaseHistoryPage;
