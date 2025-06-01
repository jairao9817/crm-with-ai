import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Chip } from "@heroui/react";
import {
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BriefcaseIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CommunicationService } from "../services/communicationService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
import {
  PageContainerList,
  FormModal,
  FormField,
  usePageData,
  useFormModal,
} from "../components/common";
import { ObjectionHandler } from "../components/ObjectionHandler";
import { useDisclosure } from "@heroui/react";
import type { StatItem } from "../components/common";
import type {
  Communication,
  CreateCommunicationInput,
  CommunicationFilters,
  Contact,
  Deal,
  CommunicationType,
} from "../types/index";

interface CommunicationFormData {
  contact_id: string;
  deal_id?: string;
  type: CommunicationType;
  subject?: string;
  content?: string;
  communication_date?: string;
}

const COMMUNICATION_TYPES = [
  { key: "phone_call", label: "Phone Call" },
  { key: "email", label: "Email" },
  { key: "meeting", label: "Meeting" },
  { key: "note", label: "Note" },
];

const CommunicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    items: communications,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    refreshData,
  } = usePageData<Communication, CommunicationFilters>({
    loadData: CommunicationService.getCommunications,
    loadAdditionalData: async () => {
      const [contactsData, dealsData] = await Promise.all([
        ContactService.getContacts(),
        DealService.getDeals(),
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
    },
  });

  const { isOpen, onOpen, onClose, form, handleSubmit, isSubmitting } =
    useFormModal<CommunicationFormData>({
      onSubmit: async (data) => {
        const communicationData: CreateCommunicationInput = {
          contact_id: data.contact_id,
          deal_id: data.deal_id || undefined,
          type: data.type,
          subject: data.subject,
          content: data.content,
          communication_date:
            data.communication_date || new Date().toISOString(),
        };
        await CommunicationService.createCommunication(communicationData);
      },
      onSuccess: refreshData,
    });

  const {
    isOpen: isObjectionHandlerOpen,
    onOpen: onObjectionHandlerOpen,
    onClose: onObjectionHandlerClose,
  } = useDisclosure();

  const selectedContactId = form.watch("contact_id");

  const getTypeIcon = (type: CommunicationType) => {
    const icons = {
      phone_call: <PhoneIcon className="w-4 h-4" />,
      email: <EnvelopeIcon className="w-4 h-4" />,
      meeting: <CalendarIcon className="w-4 h-4" />,
      note: <DocumentTextIcon className="w-4 h-4" />,
    };
    return icons[type] || <ChatBubbleLeftRightIcon className="w-4 h-4" />;
  };

  const getTypeColor = (
    type: CommunicationType
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: Record<
      CommunicationType,
      "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    > = {
      phone_call: "primary",
      email: "secondary",
      meeting: "success",
      note: "warning",
    };
    return colors[type] || "default";
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  const communicationsByType = communications.reduce((acc, comm) => {
    acc[comm.type] = (acc[comm.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats: StatItem[] = [
    {
      label: "Total",
      value: communications.length,
      icon: (
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      ),
      iconBgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Phone Calls",
      value: communicationsByType.phone_call || 0,
      icon: <PhoneIcon className="w-6 h-6 text-primary" />,
      color: "text-primary",
      iconBgColor: "bg-primary-100 dark:bg-primary-900",
    },
    {
      label: "Emails",
      value: communicationsByType.email || 0,
      icon: <EnvelopeIcon className="w-6 h-6 text-secondary" />,
      color: "text-secondary",
      iconBgColor: "bg-secondary-100 dark:bg-secondary-900",
    },
    {
      label: "Meetings",
      value: communicationsByType.meeting || 0,
      icon: <CalendarIcon className="w-6 h-6 text-success" />,
      color: "text-success",
      iconBgColor: "bg-success-100 dark:bg-success-900",
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

  const renderCommunicationItem = (communication: Communication) => (
    <div className="flex items-start justify-between group">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-1">
          <div
            className={`
              relative p-3 rounded-xl shadow-sm border-2 transition-all duration-200
              ${
                communication.type === "phone_call"
                  ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800/30"
                  : communication.type === "email"
                  ? "bg-secondary-50 border-secondary-200 text-secondary-600 dark:bg-secondary-900/20 dark:border-secondary-800/30"
                  : communication.type === "meeting"
                  ? "bg-success-50 border-success-200 text-success-600 dark:bg-success-900/20 dark:border-success-800/30"
                  : "bg-warning-50 border-warning-200 text-warning-600 dark:bg-warning-900/20 dark:border-warning-800/30"
              }
              group-hover:shadow-md group-hover:scale-105
            `}
          >
            {getTypeIcon(communication.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-text-primary truncate flex-1 min-w-0 group-hover:text-primary-600 transition-colors">
              {communication.subject ||
                `${communication.type.replace("_", " ")} Communication`}
            </h3>
            <div className="flex-shrink-0">
              <div
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border
                  ${
                    communication.type === "phone_call"
                      ? "bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700/30"
                      : communication.type === "email"
                      ? "bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-700/30"
                      : communication.type === "meeting"
                      ? "bg-success-100 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-300 dark:border-success-700/30"
                      : "bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-700/30"
                  }
                `}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {communication.type.replace("_", " ").charAt(0).toUpperCase() +
                  communication.type.replace("_", " ").slice(1)}
              </div>
            </div>
          </div>
          {communication.content && (
            <div className="bg-background-secondary/50 rounded-lg p-3 border border-border/50">
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                {communication.content}
              </p>
            </div>
          )}
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background-secondary text-text-secondary hover:bg-background-tertiary transition-colors">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="font-medium truncate max-w-32">
                {communication.contact?.name || "Unknown Contact"}
              </span>
            </div>

            {communication.deal && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                <span className="font-medium truncate max-w-32">
                  {communication.deal.title}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-text-tertiary">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{formatDate(communication.communication_date)}</span>
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
        name="type"
        control={form.control}
        label="Type"
        type="select"
        placeholder="All types"
        options={COMMUNICATION_TYPES}
        onSelectionChange={(value) =>
          setFilters((prev) => ({ ...prev, type: value as CommunicationType }))
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
    <>
      <PageContainerList
        title="Communications"
        subtitle="Track and manage customer communications"
        actionLabel="Log Communication"
        actionIcon={<PlusIcon className="w-4 h-4" />}
        onAction={onOpen}
        stats={stats}
        searchValue={filters.search || ""}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value }))
        }
        searchPlaceholder="Search communications..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filtersContent={filtersContent}
        items={communications}
        loading={loading}
        renderItem={renderCommunicationItem}
        onItemClick={(communication) =>
          navigate(`/communications/${communication.id}`)
        }
        emptyState={{
          icon: <ChatBubbleLeftRightIcon className="w-16 h-16" />,
          title: "No communications found",
          description:
            "Start logging your customer communications to track interactions.",
          actionLabel: "Log Communication",
          onAction: onOpen,
        }}
      >
        <FormModal
          isOpen={isOpen}
          onClose={onClose}
          title="Log New Communication"
          onSubmit={form.handleSubmit(handleSubmit)}
          isSubmitting={isSubmitting}
          submitLabel="Log Communication"
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
            name="type"
            control={form.control}
            label="Communication Type"
            type="select"
            required
            options={COMMUNICATION_TYPES}
          />
          <FormField
            name="deal_id"
            control={form.control}
            label="Deal (Optional)"
            type="select"
            options={dealOptions}
          />
          <FormField
            name="subject"
            control={form.control}
            label="Subject (Optional)"
            placeholder="Enter communication subject"
          />
          <FormField
            name="content"
            control={form.control}
            label="Content"
            type="textarea"
            placeholder="Enter communication details"
          />
          <FormField
            name="communication_date"
            control={form.control}
            label="Date & Time"
            type="datetime-local"
            defaultValue={new Date().toISOString().slice(0, 16)}
          />
        </FormModal>

        {/* Objection Handler Modal */}
        <ObjectionHandler
          isOpen={isObjectionHandlerOpen}
          onClose={onObjectionHandlerClose}
          context={
            {
              // Context will be empty here since we're not in a specific communication
              // Users can still use it for general objection handling
            }
          }
        />
      </PageContainerList>

      {/* Handle Objection Button - Positioned as a floating action */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          color="warning"
          variant="bordered"
          startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
          onPress={onObjectionHandlerOpen}
          className="shadow-lg"
          endContent={
            <Chip size="sm" color="warning" variant="flat">
              AI
            </Chip>
          }
        >
          Handle Objection
        </Button>
      </div>
    </>
  );
};

export default CommunicationsPage;
