import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
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
import HeroSection from "../components/HeroSection";
import DetailCard from "../components/DetailCard";
import SidebarActions from "../components/SidebarActions";
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString();

  if (!purchase) return null;

  const sidebarActions = [
    {
      label: "Edit Purchase",
      color: "primary" as const,
      icon: <ShoppingCartIcon className="w-4 h-4" />,
      onClick: handleEdit,
    },
    {
      label: "Delete Record",
      color: "danger" as const,
      icon: <XCircleIcon className="w-4 h-4" />,
      onClick: handleDelete,
    },
  ];

  const productItems = [
    {
      label: "Product/Service",
      value: purchase.product_service,
      icon: <HashtagIcon className="w-4 h-4 text-gray-500" />,
    },
    {
      label: "Total Amount",
      value: (
        <span className="text-success font-bold">
          {formatCurrency(purchase.amount)}
        </span>
      ),
      icon: <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />,
    },
  ];

  const timelineItems = [
    {
      label: "Purchase Date",
      value: formatDate(purchase.date),
      icon: <CalendarIcon className="w-4 h-4 text-gray-500" />,
    },
    {
      label: "Status",
      value: purchase.status,
      icon: getStatusIcon(purchase.status),
    },
    ...(purchase.created_at
      ? [
          {
            label: "Record Created",
            value: formatDateTime(purchase.created_at),
            icon: <ClockIcon className="w-4 h-4 text-gray-500" />,
          },
        ]
      : []),
  ];

  return (
    <DetailPageLayout
      loading={loading}
      item={purchase}
      title="Purchase Details"
      subtitle={`Purchase #${purchase.id?.slice(-8)}`}
      onBack={() => navigate("/purchase-history")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Purchase History"
    >
      <HeroSection
        title={purchase.product_service}
        status={{
          value: purchase.status,
          color: getStatusColor(purchase.status),
          icon: getStatusIcon(purchase.status),
        }}
        date={{
          label: "Date",
          value: formatDate(purchase.date),
        }}
        gradient="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20"
        avatar={{
          icon: <ShoppingCartIcon className="w-8 h-8" />,
          className: "bg-primary-100 dark:bg-primary-900 text-primary",
        }}
        actions={
          <div className="text-center lg:text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Purchase Amount
            </p>
            <p className="text-4xl lg:text-5xl font-bold text-success">
              {formatCurrency(purchase.amount)}
            </p>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <DetailCard
            title="Product & Service Information"
            icon={
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
            items={productItems}
          />

          <DetailCard
            title="Timeline & Details"
            icon={
              <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            }
            iconBgColor="bg-purple-100 dark:bg-purple-900/20"
            items={timelineItems}
            columns={3}
          />
        </div>

        <SidebarActions actions={sidebarActions}>
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
        </SidebarActions>
      </div>

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
                      startContent={<BuildingOfficeIcon className="w-4 h-4" />}
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
                      startContent={<CurrencyDollarIcon className="w-4 h-4" />}
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
                        field.onChange(Array.from(keys)[0] as PurchaseStatus)
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
    </DetailPageLayout>
  );
};

export default PurchaseHistoryDetailPage;
