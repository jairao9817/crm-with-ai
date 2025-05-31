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
  Textarea,
} from "@heroui/react";
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { CommunicationService } from "../services/communicationService";
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
  Communication,
  UpdateCommunicationInput,
  Contact,
  Deal,
  CommunicationType,
} from "../types";

interface CommunicationFormData {
  contact_id: string;
  deal_id?: string;
  type: CommunicationType;
  subject?: string;
  content?: string;
  communication_date?: string;
}

const CommunicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const {
    item: communication,
    loading,
    submitting,
    isEditOpen,
    onEditOpen,
    onEditClose,
    handleUpdate,
    handleDelete,
    navigate,
  } = useDetailPage<Communication>({
    id,
    loadItem: CommunicationService.getCommunication,
    updateItem: async (id: string, data: UpdateCommunicationInput) => {
      await CommunicationService.updateCommunication(id, data);
    },
    deleteItem: CommunicationService.deleteCommunication,
    redirectPath: "/communications",
    itemName: "communication",
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommunicationFormData>();

  const selectedContactId = watch("contact_id");

  useEffect(() => {
    Promise.all([
      ContactService.getContacts().then(setContacts),
      DealService.getDeals().then(setDeals),
    ]).catch(console.error);
  }, []);

  const handleEdit = () => {
    if (!communication) return;
    reset({
      contact_id: communication.contact_id,
      deal_id: communication.deal_id || "",
      type: communication.type,
      subject: communication.subject || "",
      content: communication.content || "",
      communication_date: communication.communication_date
        ? new Date(communication.communication_date).toISOString().slice(0, 16)
        : "",
    });
    onEditOpen();
  };

  const onEditSubmit = async (data: CommunicationFormData) => {
    await handleUpdate({
      contact_id: data.contact_id,
      deal_id: data.deal_id || undefined,
      type: data.type,
      subject: data.subject,
      content: data.content,
      communication_date: data.communication_date,
    });
  };

  const typeConfig = {
    phone_call: {
      icon: <PhoneIcon className="w-5 h-5" />,
      color: "primary",
      label: "Phone Call",
    },
    email: {
      icon: <EnvelopeIcon className="w-5 h-5" />,
      color: "secondary",
      label: "Email",
    },
    meeting: {
      icon: <CalendarIcon className="w-5 h-5" />,
      color: "success",
      label: "Meeting",
    },
    note: {
      icon: <DocumentTextIcon className="w-5 h-5" />,
      color: "warning",
      label: "Note",
    },
  };

  const getTypeConfig = (type: CommunicationType) =>
    typeConfig[type] || {
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      color: "default",
      label: type,
    };

  const getContactDeals = (contactId: string) =>
    deals.filter((deal) => deal.contact_id === contactId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  if (!communication) return null;

  const config = getTypeConfig(communication.type);

  const sidebarActions = [
    {
      label: "Edit Communication",
      color: "primary" as const,
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
      onClick: handleEdit,
    },
    {
      label: "Delete Record",
      color: "danger" as const,
      icon: <DocumentTextIcon className="w-4 h-4" />,
      onClick: handleDelete,
    },
  ];

  const timelineItems = [
    {
      label: "Date & Time",
      value: formatDate(communication.communication_date),
      icon: <ClockIcon className="w-4 h-4 text-gray-500" />,
    },
    {
      label: "Communication Type",
      value: config.label,
      icon: config.icon,
    },
    ...(communication.created_at
      ? [
          {
            label: "Record Created",
            value: formatDate(communication.created_at),
            icon: <DocumentTextIcon className="w-4 h-4 text-gray-500" />,
          },
        ]
      : []),
  ];

  return (
    <DetailPageLayout
      loading={loading}
      item={communication}
      title="Communication Details"
      subtitle={`Communication #${communication.id?.slice(-8)}`}
      onBack={() => navigate("/communications")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Communications"
    >
      <HeroSection
        title={communication.subject || `${config.label} Communication`}
        status={{
          value: config.label,
          color: config.color as any,
          icon: config.icon,
        }}
        date={{
          label: "Date",
          value: formatDate(communication.communication_date),
        }}
        description={
          communication.content?.substring(0, 150) +
          (communication.content && communication.content.length > 150
            ? "..."
            : "")
        }
        gradient="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20"
        avatar={{
          icon: config.icon,
          className: `bg-${config.color}-100 dark:bg-${config.color}-900/20 text-${config.color}`,
        }}
        actions={
          <div className="text-center">
            <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div
                className={`p-3 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/20 mb-2`}
              >
                {config.icon}
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Type
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {config.label}
              </p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <DetailCard
            title="Communication Content"
            icon={
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            }
            iconBgColor="bg-green-100 dark:bg-green-900/20"
            items={[]}
            content={
              <>
                {communication.subject && (
                  <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <HashtagIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Subject
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {communication.subject}
                    </h3>
                  </div>
                )}
                {communication.content ? (
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {communication.content}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No content provided.
                    </p>
                  </div>
                )}
              </>
            }
          />

          <DetailCard
            title="Communication Details"
            icon={
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
            items={timelineItems}
          />
        </div>

        <SidebarActions actions={sidebarActions}>
          {communication.contact && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact
                </h3>
              </div>
              <ContactCard contact={communication.contact} />
            </div>
          )}

          {communication.deal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Related Deal
                </h3>
              </div>
              <DealCard deal={communication.deal} />
            </div>
          )}
        </SidebarActions>
      </div>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <ModalHeader>Edit Communication</ModalHeader>
            <ModalBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="contact_id"
                  control={control}
                  rules={{ required: "Contact is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Contact"
                      isInvalid={!!errors.contact_id}
                      errorMessage={errors.contact_id?.message}
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0])
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
                  name="type"
                  control={control}
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Type"
                      isInvalid={!!errors.type}
                      errorMessage={errors.type?.message}
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) =>
                        field.onChange(Array.from(keys)[0] as CommunicationType)
                      }
                    >
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key}>{config.label}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <Controller
                name="deal_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Deal (Optional)"
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

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Subject (Optional)" />
                  )}
                />

                <Controller
                  name="communication_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="datetime-local"
                      label="Date & Time"
                    />
                  )}
                />
              </div>

              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Content"
                    placeholder="Enter communication details"
                    minRows={4}
                  />
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </DetailPageLayout>
  );
};

export default CommunicationDetailPage;
