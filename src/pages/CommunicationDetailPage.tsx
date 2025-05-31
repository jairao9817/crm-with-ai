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
  Textarea,
  Avatar,
  Divider,
  Badge,
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
    const communicationData: UpdateCommunicationInput = {
      contact_id: data.contact_id,
      deal_id: data.deal_id || undefined,
      type: data.type,
      subject: data.subject,
      content: data.content,
      communication_date: data.communication_date,
    };

    await handleUpdate(communicationData);
  };

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case "phone_call":
        return <PhoneIcon className="w-5 h-5" />;
      case "email":
        return <EnvelopeIcon className="w-5 h-5" />;
      case "meeting":
        return <CalendarIcon className="w-5 h-5" />;
      case "note":
        return <DocumentTextIcon className="w-5 h-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: CommunicationType) => {
    switch (type) {
      case "phone_call":
        return "primary";
      case "email":
        return "secondary";
      case "meeting":
        return "success";
      case "note":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeDisplayName = (type: CommunicationType) => {
    switch (type) {
      case "phone_call":
        return "Phone Call";
      case "email":
        return "Email";
      case "meeting":
        return "Meeting";
      case "note":
        return "Note";
      default:
        return (type as string).replace("_", " ");
    }
  };

  const getContactDeals = (contactId: string) => {
    return deals.filter((deal) => deal.contact_id === contactId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DetailPageLayout
      loading={loading}
      item={communication}
      title="Communication Details"
      subtitle={
        communication
          ? `Communication #${communication.id?.slice(-8)}`
          : undefined
      }
      onBack={() => navigate("/communications")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Communications"
    >
      {communication && (
        <>
          {/* Hero Section with Communication Overview */}
          <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
            <CardBody className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <Avatar
                      icon={getTypeIcon(communication.type)}
                      className={`w-16 h-16 bg-${getTypeColor(
                        communication.type
                      )}-100 dark:bg-${getTypeColor(
                        communication.type
                      )}-900/20 text-${getTypeColor(
                        communication.type
                      )} text-large`}
                    />
                    <Badge
                      color={getTypeColor(communication.type)}
                      className="absolute -top-1 -right-1"
                      size="lg"
                    >
                      •
                    </Badge>
                  </div>
                  <div className="space-y-3 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {communication.subject ||
                        `${getTypeDisplayName(
                          communication.type
                        )} Communication`}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <Chip
                        color={getTypeColor(communication.type)}
                        variant="solid"
                        size="lg"
                        startContent={getTypeIcon(communication.type)}
                        className="font-semibold"
                      >
                        {getTypeDisplayName(communication.type).toUpperCase()}
                      </Chip>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDate(communication.communication_date)}
                        </span>
                      </div>
                    </div>

                    {/* Communication Summary */}
                    {communication.content && (
                      <div className="max-w-2xl">
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {communication.content.substring(0, 150)}
                          {communication.content.length > 150 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Communication Type Badge */}
                <div className="text-center">
                  <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div
                      className={`p-3 rounded-lg bg-${getTypeColor(
                        communication.type
                      )}-100 dark:bg-${getTypeColor(
                        communication.type
                      )}-900/20 mb-2`}
                    >
                      {getTypeIcon(communication.type)}
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getTypeDisplayName(communication.type)}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content - Takes up 2/3 on large screens */}
            <div className="xl:col-span-3 space-y-8">
              {/* Communication Content */}
              <Card className="shadow-md">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Communication Content
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="pt-6">
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
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                        {communication.content}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No content provided for this communication.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Communication Details */}
              <Card className="shadow-md">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Communication Details
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Date & Time
                          </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white pl-6">
                          {formatDate(communication.communication_date)}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(communication.type)}
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Communication Type
                          </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white capitalize pl-6">
                          {getTypeDisplayName(communication.type)}
                        </p>
                      </div>
                    </div>

                    <Divider />

                    {communication.created_at && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Record Created
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium pl-6">
                            {formatDate(communication.created_at)}
                          </p>
                        </div>

                        {communication.updated_at &&
                          communication.updated_at !==
                            communication.created_at && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Last Updated
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-medium pl-6">
                                {formatDate(communication.updated_at)}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar - Takes up 1/3 on large screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Contact Information */}
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

              {/* Deal Information */}
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
                      startContent={
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      }
                    >
                      Edit Communication
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      fullWidth
                      onPress={handleDelete}
                      startContent={<DocumentTextIcon className="w-4 h-4" />}
                    >
                      Delete Record
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Communication Summary */}
              <Card className="shadow-md">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Summary
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Type
                      </span>
                      <Chip
                        color={getTypeColor(communication.type)}
                        variant="flat"
                        size="sm"
                        startContent={getTypeIcon(communication.type)}
                      >
                        {getTypeDisplayName(communication.type)}
                      </Chip>
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Date
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {formatDateOnly(communication.communication_date)}
                      </span>
                    </div>

                    {communication.subject && (
                      <>
                        <Divider />
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Subject
                          </span>
                          <p className="font-medium text-gray-900 dark:text-white text-sm mt-1 line-clamp-2">
                            {communication.subject}
                          </p>
                        </div>
                      </>
                    )}
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
                  Edit Communication
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
                      name="type"
                      control={control}
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Communication Type"
                          placeholder="Select type"
                          isInvalid={!!errors.type}
                          errorMessage={errors.type?.message}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) =>
                            field.onChange(
                              Array.from(keys)[0] as CommunicationType
                            )
                          }
                          startContent={
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          }
                        >
                          <SelectItem key="phone_call">Phone Call</SelectItem>
                          <SelectItem key="email">Email</SelectItem>
                          <SelectItem key="meeting">Meeting</SelectItem>
                          <SelectItem key="note">Note</SelectItem>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Subject (Optional)"
                          placeholder="Enter communication subject"
                          startContent={<HashtagIcon className="w-4 h-4" />}
                        />
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
                          startContent={<CalendarIcon className="w-4 h-4" />}
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
                    Update Communication
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

export default CommunicationDetailPage;
