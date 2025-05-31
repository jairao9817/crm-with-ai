import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Textarea,
  Badge,
  Avatar,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { CommunicationService } from "../services/communicationService";
import { ContactService } from "../services/contactService";
import { DealService } from "../services/dealService";
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
  const navigate = useNavigate();

  const [communication, setCommunication] = useState<Communication | null>(
    null
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommunicationFormData>();

  const selectedContactId = watch("contact_id");

  useEffect(() => {
    if (id) {
      loadCommunication();
      loadContacts();
      loadDeals();
    }
  }, [id]);

  const loadCommunication = async () => {
    try {
      setLoading(true);
      const data = await CommunicationService.getCommunication(id!);
      setCommunication(data);
    } catch (error) {
      console.error("Failed to load communication:", error);
      navigate("/communications");
    } finally {
      setLoading(false);
    }
  };

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
    if (!communication) return;

    try {
      setSubmitting(true);
      const communicationData: UpdateCommunicationInput = {
        contact_id: data.contact_id,
        deal_id: data.deal_id || undefined,
        type: data.type,
        subject: data.subject,
        content: data.content,
        communication_date: data.communication_date,
      };

      await CommunicationService.updateCommunication(
        communication.id,
        communicationData
      );
      await loadCommunication();
      onEditClose();
    } catch (error) {
      console.error("Failed to update communication:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!communication) return;

    if (window.confirm("Are you sure you want to delete this communication?")) {
      try {
        await CommunicationService.deleteCommunication(communication.id);
        navigate("/communications");
      } catch (error) {
        console.error("Failed to delete communication:", error);
      }
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!communication) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Communication not found
        </h2>
        <Button
          color="primary"
          onPress={() => navigate("/communications")}
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Communications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            isIconOnly
            onPress={() => navigate("/communications")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Communication Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(communication.communication_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            variant="light"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={handleEdit}
          >
            Edit
          </Button>
          <Button
            color="danger"
            variant="light"
            startContent={<TrashIcon className="w-4 h-4" />}
            onPress={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

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
                      `${communication.type.replace("_", " ")} Communication`}
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
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Contact
              </h3>
            </CardHeader>
            <CardBody>
              {communication.contact ? (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {communication.contact.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {communication.contact.email}
                  </p>
                  {communication.contact.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {communication.contact.phone}
                    </p>
                  )}
                  {communication.contact.company && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Company:</strong> {communication.contact.company}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Contact information not available
                </p>
              )}
            </CardBody>
          </Card>

          {/* Deal Information */}
          {communication.deal && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5" />
                  Associated Deal
                </h3>
              </CardHeader>
              <CardBody>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {communication.deal.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      content={communication.deal.stage}
                      color="primary"
                      variant="flat"
                    />
                    <span className="text-lg font-semibold text-success">
                      {communication.deal.value != null
                        ? `$${communication.deal.value.toLocaleString()}`
                        : "$0"}
                    </span>
                  </div>
                  {communication.deal.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {communication.deal.description}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

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
                      field.onChange(Array.from(keys)[0] as CommunicationType)
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
                  <Input {...field} type="datetime-local" label="Date & Time" />
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
    </div>
  );
};

export default CommunicationDetailPage;
