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
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import {
  PageContainerList,
  FormModal,
  FormField,
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
} from "../types/index";

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
    <div className="flex items-start justify-between group">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-1">
          <div
            className={`
              relative p-3 rounded-xl shadow-sm border-2 transition-all duration-200
              ${
                purchase.status === "completed"
                  ? "bg-success-50 border-success-200 text-success-600 dark:bg-success-900/20 dark:border-success-800/30"
                  : purchase.status === "pending"
                  ? "bg-warning-50 border-warning-200 text-warning-600 dark:bg-warning-900/20 dark:border-warning-800/30"
                  : purchase.status === "refunded"
                  ? "bg-danger-50 border-danger-200 text-danger-600 dark:bg-danger-900/20 dark:border-danger-800/30"
                  : "bg-secondary-50 border-secondary-200 text-secondary-600 dark:bg-secondary-900/20 dark:border-secondary-800/30"
              }
              group-hover:shadow-md group-hover:scale-105
            `}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {purchase.status === "pending" && (
              <div className="absolute inset-0 rounded-xl bg-warning-400 opacity-20 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-text-primary truncate flex-1 min-w-0 group-hover:text-primary-600 transition-colors">
              {purchase.product_service}
            </h3>
            <div className="flex-shrink-0">
              <div
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border
                  ${
                    purchase.status === "completed"
                      ? "bg-success-100 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700/30"
                      : purchase.status === "pending"
                      ? "bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700/30"
                      : purchase.status === "refunded"
                      ? "bg-danger-100 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-700/30"
                      : "bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-700/30"
                  }
                `}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {purchase.status.charAt(0).toUpperCase() +
                  purchase.status.slice(1)}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-success-200/50 dark:border-success-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                <CurrencyDollarIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-xs text-success-600 dark:text-success-400 font-medium uppercase tracking-wide">
                  Purchase Amount
                </p>
                <p className="text-2xl font-bold text-success-700 dark:text-success-300">
                  {formatCurrency(purchase.amount)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background-secondary text-text-secondary hover:bg-background-tertiary transition-colors">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="font-medium truncate max-w-32">
                {purchase.contact?.name || "Unknown Contact"}
              </span>
            </div>

            {purchase.deal && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                <span className="font-medium truncate max-w-32">
                  {purchase.deal.title}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-text-tertiary">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{formatDate(purchase.date)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="p-2 rounded-lg bg-background-secondary text-text-tertiary hover:bg-background-tertiary hover:text-text-primary transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
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
    <PageContainerList
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
    </PageContainerList>
  );
};

export default PurchaseHistoryPage;
