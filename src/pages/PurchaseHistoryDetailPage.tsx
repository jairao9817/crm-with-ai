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
} from "@heroui/react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
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

  return (
    <DetailPageLayout
      loading={loading}
      item={purchase}
      title="Purchase Details"
      subtitle={purchase ? formatDate(purchase.date) : undefined}
      onBack={() => navigate("/purchase-history")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Purchase History"
    >
      {purchase && (
        <>
          {/* Purchase Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar
                        icon={<ShoppingCartIcon className="w-6 h-6" />}
                        className="bg-primary-100 dark:bg-primary-900 text-primary"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {purchase.product_service}
                        </h2>
                        <Chip
                          color={getStatusColor(purchase.status)}
                          variant="flat"
                          size="sm"
                          startContent={getStatusIcon(purchase.status)}
                        >
                          {purchase.status}
                        </Chip>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(purchase.amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Product/Service Details
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {purchase.product_service}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              {purchase.contact && (
                <ContactCard contact={purchase.contact} title="Customer" />
              )}

              {/* Deal Information */}
              {purchase.deal && <DealCard deal={purchase.deal} />}

              {/* Purchase Metadata */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Purchase Details
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Purchase Date
                        </span>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(purchase.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Amount
                        </span>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(purchase.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(purchase.status)}
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {purchase.status}
                        </p>
                      </div>
                    </div>

                    {purchase.created_at && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Record Created
                        </span>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(purchase.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Edit Modal */}
          <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
            <ModalContent>
              <form onSubmit={handleSubmit(onEditSubmit)}>
                <ModalHeader>Edit Purchase Record</ModalHeader>
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
                        startContent="$"
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
