import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@heroui/react";
import {
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CommunicationService } from "../services/communicationService";
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
    <ItemCard
      title={
        communication.subject ||
        `${communication.type.replace("_", " ")} Communication`
      }
      icon={getTypeIcon(communication.type)}
      chipLabel={communication.type.replace("_", " ")}
      chipColor={getTypeColor(communication.type)}
      chipIcon={getTypeIcon(communication.type)}
      avatarColor={`bg-${getTypeColor(
        communication.type
      )}-100 text-${getTypeColor(communication.type)}`}
      metadata={[
        { label: "Contact", value: communication.contact?.name || "" },
        ...(communication.deal
          ? [{ label: "Deal", value: communication.deal.title }]
          : []),
        { label: "Date", value: formatDate(communication.communication_date) },
      ]}
      content={communication.content}
    />
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
      <PageContainer
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
      </PageContainer>

      {/* Handle Objection Button - Positioned as a floating action */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          color="warning"
          variant="bordered"
          startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
          onPress={onObjectionHandlerOpen}
          className="shadow-lg"
        >
          Handle Objection
        </Button>
      </div>
    </>
  );
};

export default CommunicationsPage;
