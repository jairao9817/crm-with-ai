import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Chip } from "@heroui/react";
import {
  PlusIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import {
  PageContainer,
  FormModal,
  FormField,
  ItemCard,
  usePageData,
  useFormModal,
} from "../components/common";
import type { StatItem } from "../components/common";
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

const PURCHASE_STATUSES = [
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "refunded", label: "Refunded" },
  { key: "cancelled", label: "Cancelled" },
];

const PurchaseHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,
    refundedRevenue: 0,
    thisMonthRevenue: 0,
    purchaseCount: 0,
  });

  const {
    items: purchases,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    refreshData,
  } = usePageData<PurchaseHistory, PurchaseHistoryFilters>({
    loadData: PurchaseHistoryService.getPurchaseHistory,
    loadAdditionalData: async () => {
      const [contactsData, dealsData, statsData] = await Promise.all([
        ContactService.getContacts(),
        DealService.getDeals(),
        PurchaseHistoryService.getRevenueStats(),
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
      setRevenueStats(statsData);
    },
  });

  const { isOpen, onOpen, onClose, form, handleSubmit, isSubmitting } =
    useFormModal<PurchaseFormData>({
      onSubmit: async (data) => {
        const purchaseData: CreatePurchaseHistoryInput = {
          contact_id: data.contact_id,
          deal_id: data.deal_id || undefined,
          date: data.date,
          amount: data.amount,
          product_service: data.product_service,
          status: data.status,
        };
        await PurchaseHistoryService.createPurchaseHistory(purchaseData);
      },
      onSuccess: refreshData,
    });

  const selectedContactId = form.watch("contact_id");

  const getStatusIcon = (status: PurchaseStatus) => {
    const icons = {
      completed: <CheckCircleIcon className="w-4 h-4" />,
      pending: <ClockIcon className="w-4 h-4" />,
      refunded: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />,
    };
    return icons[status] || <ShoppingCartIcon className="w-4 h-4" />;
  };

  const getStatusColor = (
    status: PurchaseStatus
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: Record<
      PurchaseStatus,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      completed: "success",
      pending: "warning",
      refunded: "danger",
      cancelled: "default",
    };
    return colors[status] || "default";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const stats: StatItem[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(revenueStats.totalRevenue),
      icon: <CurrencyDollarIcon className="w-5 h-5 text-primary" />,
      color: "text-primary",
      iconBgColor: "bg-primary-100 dark:bg-primary-900",
    },
    {
      label: "Completed Revenue",
      value: formatCurrency(revenueStats.completedRevenue),
      icon: <CheckCircleIcon className="w-5 h-5 text-success" />,
      color: "text-success",
      iconBgColor: "bg-success-100 dark:bg-success-900",
    },
    {
      label: "Pending Revenue",
      value: formatCurrency(revenueStats.pendingRevenue),
      icon: <ClockIcon className="w-5 h-5 text-warning" />,
      color: "text-warning",
      iconBgColor: "bg-warning-100 dark:bg-warning-900",
    },
    {
      label: "Refunded Revenue",
      value: formatCurrency(revenueStats.refundedRevenue),
      icon: <ArrowPathIcon className="w-5 h-5 text-secondary" />,
      color: "text-secondary",
      iconBgColor: "bg-secondary-100 dark:bg-secondary-900",
    },
  ];

  const contactDeals = deals.filter(
    (deal) => deal.contact_id === selectedContactId
  );
  const contactOptions = contacts.map((contact) => ({
    key: contact.id,
    label: `${contact.name} (${contact.email})`,
  }));
  const dealOptions = contactDeals.map((deal) => ({
    key: deal.id,
    label: deal.title,
  }));

  const renderPurchaseItem = (purchase: PurchaseHistory) => (
    <ItemCard
      title={purchase.product_service}
      subtitle={formatCurrency(purchase.amount)}
      topContent={
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
      }
      metadata={[
        { label: "Customer", value: purchase.contact?.name || "" },
        ...(purchase.deal
          ? [{ label: "Deal", value: purchase.deal.title }]
          : []),
        { label: "Date", value: formatDate(purchase.date) },
      ]}
    />
  );

  const filtersContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FormField
        name="status"
        control={form.control}
        label="Status"
        type="select"
        placeholder="All statuses"
        options={PURCHASE_STATUSES}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value as PurchaseStatus }))
        }
      />
      <FormField
        name="contact_id"
        control={form.control}
        label="Contact"
        type="select"
        placeholder="All contacts"
        options={contactOptions}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, contact_id: value }))
        }
      />
      <Input
        type="date"
        label="From Date"
        value={filters.date_from || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, date_from: e.target.value }))
        }
      />
      <Input
        type="date"
        label="To Date"
        value={filters.date_to || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, date_to: e.target.value }))
        }
      />
    </div>
  );

  return (
    <PageContainer
      title="Purchase History"
      subtitle="Track customer purchases and revenue"
      actionLabel="Add Purchase"
      actionIcon={<PlusIcon className="w-4 h-4" />}
      onAction={onOpen}
      stats={stats}
      searchValue={filters.search || ""}
      onSearchChange={(value) =>
        setFilters((prev) => ({ ...prev, search: value }))
      }
      searchPlaceholder="Search purchases..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filtersContent={filtersContent}
      items={purchases}
      loading={loading}
      renderItem={renderPurchaseItem}
      onItemClick={(purchase) => navigate(`/purchase-history/${purchase.id}`)}
      emptyState={{
        icon: <ShoppingCartIcon className="w-16 h-16" />,
        title: "No purchase history found",
        description: "Start tracking customer purchases to analyze revenue.",
        actionLabel: "Add Purchase",
        onAction: onOpen,
      }}
    >
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Add New Purchase"
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        submitLabel="Add Purchase"
      >
        <FormField
          name="contact_id"
          control={form.control}
          label="Contact"
          type="select"
          required
          options={contactOptions}
        />
        <FormField
          name="deal_id"
          control={form.control}
          label="Deal (Optional)"
          type="select"
          options={dealOptions}
        />
        <FormField
          name="product_service"
          control={form.control}
          label="Product/Service"
          required
          placeholder="Enter product or service name"
        />
        <FormField
          name="amount"
          control={form.control}
          label="Amount"
          type="number"
          required
          step="0.01"
          startContent="$"
          rules={{ min: { value: 0, message: "Amount must be positive" } }}
        />
        <FormField
          name="date"
          control={form.control}
          label="Purchase Date"
          type="date"
          required
          defaultValue={new Date().toISOString().split("T")[0]}
        />
        <FormField
          name="status"
          control={form.control}
          label="Status"
          type="select"
          required
          options={PURCHASE_STATUSES}
        />
      </FormModal>
    </PageContainer>
  );
};

export default PurchaseHistoryPage;
