import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Avatar,
  Divider,
  Badge,
} from "@heroui/react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import { useDetailPage } from "../hooks/useDetailPage";
import DetailPageLayout from "../components/DetailPageLayout";
import ContactCard from "../components/ContactCard";
import DealCard from "../components/DealCard";
import type {
  PurchaseHistory,
  UpdatePurchaseHistoryInput,
  Contact,
  Deal,
  PurchaseStatus,
} from "../types";

interface PurchaseFormData {
  contact_id: string;
  deal_id?: string;
  date: string;
  amount: string;
  product_service: string;
  status: PurchaseStatus;
}

const PurchaseHistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    item: purchase,
    loading,
    submitting,
    isEditOpen,
    onEditOpen,
    onEditClose,
    handleUpdate,
    handleDelete,
    navigate,
  } = useDetailPage<PurchaseHistory>({
    id,
    loadItem: PurchaseHistoryService.getPurchaseHistoryRecord,
    updateItem: async (id: string, data: UpdatePurchaseHistoryInput) => {
      await PurchaseHistoryService.updatePurchaseHistory(id, {
        ...data,
        amount: parseFloat(data.amount as any),
      });
    },
    deleteItem: PurchaseHistoryService.deletePurchaseHistory,
    redirectPath: "/purchase-history",
    itemName: "purchase record",
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>();

  const selectedContactId = watch("contact_id");

  useEffect(() => {
    loadContacts();
    loadDeals();
  }, []);

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

  const handleEdit = () => {
    if (!purchase) return;

    reset({
      contact_id: purchase.contact_id,
      deal_id: purchase.deal_id || "",
      date: new Date(purchase.date).toISOString().split("T")[0],
      amount: purchase.amount.toString(),
      product_service: purchase.product_service,
      status: purchase.status,
    });
    onEditOpen();
  };

  const onEditSubmit = async (data: PurchaseFormData) => {
    const purchaseData: UpdatePurchaseHistoryInput = {
      contact_id: data.contact_id,
      deal_id: data.deal_id || undefined,
      date: data.date,
      amount: parseFloat(data.amount),
      product_service: data.product_service,
      status: data.status,
    };

    await handleUpdate(purchaseData);
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "pending":
        return <ClockIcon className="w-5 h-5" />;
      case "refunded":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ShoppingCartIcon className="w-5 h-5" />;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DetailPageLayout
      loading={loading}
      item={purchase}
      title="Purchase Details"
      subtitle={purchase ? `Purchase #${purchase.id?.slice(-8)}` : undefined}
      onBack={() => navigate("/purchase-history")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Purchase History"
    >
      {purchase && (
        <>
          {/* Hero Section with Purchase Overview */}
          <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <CardBody className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar
                      icon={<ShoppingCartIcon className="w-8 h-8" />}
                      className="w-16 h-16 bg-primary-100 dark:bg-primary-900 text-primary text-large"
                    />
                    <Badge
                      color={getStatusColor(purchase.status)}
                      className="absolute -top-1 -right-1"
                      size="lg"
                    >
                      •
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {purchase.product_service}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <Chip
                        color={getStatusColor(purchase.status)}
                        variant="solid"
                        size="lg"
                        startContent={getStatusIcon(purchase.status)}
                        className="font-semibold"
                      >
                        {purchase.status.toUpperCase()}
                      </Chip>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDate(purchase.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Purchase Amount
                  </p>
                  <p className="text-4xl lg:text-5xl font-bold text-success">
                    {formatCurrency(purchase.amount)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content - Takes up 2/3 on large screens */}
            <div className="xl:col-span-3 space-y-8">
              {/* Product/Service Details */}
              <Card className="shadow-md">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Product & Service Information
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <HashtagIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Product/Service
                          </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white pl-6">
                          {purchase.product_service}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Amount
                          </span>
                        </div>
                        <p className="text-lg font-bold text-success pl-6">
                          {formatCurrency(purchase.amount)}
                        </p>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Purchase Date
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium pl-6">
                          {formatDate(purchase.date)}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(purchase.status)}
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white capitalize font-medium pl-6">
                          {purchase.status}
                        </p>
                      </div>
                      {purchase.created_at && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Record Created
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium pl-6">
                            {formatDateTime(purchase.created_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar - Takes up 1/3 on large screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Contact Information */}
              {purchase.contact && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Customer
                    </h3>
                  </div>
                  <ContactCard contact={purchase.contact} />
                </div>
              )}

              {/* Deal Information */}
              {purchase.deal && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Related Deal
                    </h3>
                  </div>
                  <DealCard deal={purchase.deal} />
                </div>
              )}

              {/* Quick Actions */}
              <Card className="shadow-md">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <Button
                      color="primary"
                      variant="flat"
                      fullWidth
                      onPress={handleEdit}
                      startContent={<ShoppingCartIcon className="w-4 h-4" />}
                    >
                      Edit Purchase
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      fullWidth
                      onPress={handleDelete}
                      startContent={<XCircleIcon className="w-4 h-4" />}
                    >
                      Delete Record
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Edit Modal */}
          <Modal
            isOpen={isEditOpen}
            onClose={onEditClose}
            size="3xl"
            scrollBehavior="inside"
          >
            <ModalContent>
              <form onSubmit={handleSubmit(onEditSubmit)}>
                <ModalHeader className="text-xl font-bold">
                  Edit Purchase Record
                </ModalHeader>
                <ModalBody className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          startContent={<UserIcon className="w-4 h-4" />}
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
                          startContent={
                            <BuildingOfficeIcon className="w-4 h-4" />
                          }
                        >
                          {getContactDeals(selectedContactId).map((deal) => (
                            <SelectItem key={deal.id}>{deal.title}</SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>

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
                        startContent={<ShoppingCartIcon className="w-4 h-4" />}
                      />
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Controller
                      name="amount"
                      control={control}
                      rules={{
                        required: "Amount is required",
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Please enter a valid amount",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Amount"
                          placeholder="0.00"
                          startContent={
                            <CurrencyDollarIcon className="w-4 h-4" />
                          }
                          isInvalid={!!errors.amount}
                          errorMessage={errors.amount?.message}
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
                          startContent={<CalendarIcon className="w-4 h-4" />}
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
                            field.onChange(
                              Array.from(keys)[0] as PurchaseStatus
                            )
                          }
                        >
                          <SelectItem key="completed">Completed</SelectItem>
                          <SelectItem key="pending">Pending</SelectItem>
                          <SelectItem key="refunded">Refunded</SelectItem>
                        </Select>
                      )}
                    />
                  </div>
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
        </>
      )}
    </DetailPageLayout>
  );
};

export default PurchaseHistoryDetailPage;
