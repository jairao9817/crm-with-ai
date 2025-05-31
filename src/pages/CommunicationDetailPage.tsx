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
} from "@heroui/react";
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
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

  const getContactDeals = (contactId: string) => {
    return deals.filter((deal) => deal.contact_id === contactId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DetailPageLayout
      loading={loading}
      item={communication}
      title="Communication Details"
      subtitle={
        communication ? formatDate(communication.communication_date) : undefined
      }
      onBack={() => navigate("/communications")}
      onEdit={handleEdit}
      onDelete={handleDelete}
      backLabel="Back to Communications"
    >
      {communication && (
        <>
          {/* Communication Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      icon={getTypeIcon(communication.type)}
                      className={`bg-${getTypeColor(
                        communication.type
                      )}-100 text-${getTypeColor(communication.type)}`}
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {communication.subject ||
                          `${communication.type.replace(
                            "_",
                            " "
                          )} Communication`}
                      </h2>
                      <Chip
                        color={getTypeColor(communication.type)}
                        variant="flat"
                        size="sm"
                        startContent={getTypeIcon(communication.type)}
                      >
                        {communication.type.replace("_", " ")}
                      </Chip>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  {communication.content ? (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Content
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {communication.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No content provided for this communication.
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              {communication.contact && (
                <ContactCard contact={communication.contact} />
              )}

              {/* Deal Information */}
              {communication.deal && <DealCard deal={communication.deal} />}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Details
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date & Time
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(communication.communication_date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </span>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {communication.type.replace("_", " ")}
                      </p>
                    </div>
                    {communication.created_at && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Created
                        </span>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(communication.created_at)}
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
                <ModalHeader>Edit Communication</ModalHeader>
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
                      >
                        <SelectItem key="phone_call">Phone Call</SelectItem>
                        <SelectItem key="email">Email</SelectItem>
                        <SelectItem key="meeting">Meeting</SelectItem>
                        <SelectItem key="note">Note</SelectItem>
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
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Subject (Optional)"
                        placeholder="Enter communication subject"
                      />
                    )}
                  />

                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Content"
                        placeholder="Enter communication details"
                        minRows={3}
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
