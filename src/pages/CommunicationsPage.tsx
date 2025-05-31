import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Badge,
  Avatar,
} from "@heroui/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
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
import type {
  Communication,
  CreateCommunicationInput,
  UpdateCommunicationInput,
  CommunicationFilters,
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

const CommunicationsPage: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [filters, setFilters] = useState<CommunicationFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm<CommunicationFormData>();

  const selectedContactId = watch("contact_id");
  const selectedEditContactId = watchEdit("contact_id");

  useEffect(() => {
    loadCommunications();
    loadContacts();
    loadDeals();
  }, [filters]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const data = await CommunicationService.getCommunications(filters);
      setCommunications(data);
    } catch (error) {
      console.error("Failed to load communications:", error);
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

  const onSubmit = async (data: CommunicationFormData) => {
    try {
      setSubmitting(true);
      const communicationData: CreateCommunicationInput = {
        contact_id: data.contact_id,
        deal_id: data.deal_id || undefined,
        type: data.type,
        subject: data.subject,
        content: data.content,
        communication_date: data.communication_date || new Date().toISOString(),
      };

      await CommunicationService.createCommunication(communicationData);
      await loadCommunications();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create communication:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: CommunicationFormData) => {
    if (!selectedCommunication) return;

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
        selectedCommunication.id,
        communicationData
      );
      await loadCommunications();
      resetEdit();
      onEditClose();
      setSelectedCommunication(null);
    } catch (error) {
      console.error("Failed to update communication:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (communication: Communication) => {
    setSelectedCommunication(communication);
    resetEdit({
      contact_id: communication.contact_id,
      deal_id: communication.deal_id || "",
      type: communication.type,
      subject: communication.subject || "",
      content: communication.content || "",
      communication_date: communication.communication_date
        ? new Date(communication.communication_date).toISOString().split("T")[0]
        : "",
    });
    onEditOpen();
  };

  const handleDelete = async (communicationId: string) => {
    if (window.confirm("Are you sure you want to delete this communication?")) {
      try {
        await CommunicationService.deleteCommunication(communicationId);
        await loadCommunications();
      } catch (error) {
        console.error("Failed to delete communication:", error);
      }
    }
  };

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case "phone_call":
        return <PhoneIcon className="w-4 h-4" />;
      case "email":
        return <EnvelopeIcon className="w-4 h-4" />;
      case "meeting":
        return <CalendarIcon className="w-4 h-4" />;
      case "note":
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
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

  const communicationsByType = communications.reduce((acc, comm) => {
    acc[comm.type] = (acc[comm.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Communications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage customer communications
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onOpen}
        >
          Log Communication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {communications.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone Calls
                </p>
                <p className="text-2xl font-bold text-primary">
                  {communicationsByType.phone_call || 0}
                </p>
              </div>
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <PhoneIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Emails
                </p>
                <p className="text-2xl font-bold text-secondary">
                  {communicationsByType.email || 0}
                </p>
              </div>
              <div className="p-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Meetings
                </p>
                <p className="text-2xl font-bold text-success">
                  {communicationsByType.meeting || 0}
                </p>
              </div>
              <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search communications..."
              startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="flex-1"
            />
            <Button
              variant={showFilters ? "solid" : "bordered"}
              startContent={<FunnelIcon className="w-4 h-4" />}
              onPress={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Select
                label="Type"
                placeholder="All types"
                selectedKeys={filters.type ? [filters.type] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    type: Array.from(keys)[0] as CommunicationType,
                  })
                }
              >
                <SelectItem key="phone_call">Phone Call</SelectItem>
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="meeting">Meeting</SelectItem>
                <SelectItem key="note">Note</SelectItem>
              </Select>

              <Select
                label="Contact"
                placeholder="All contacts"
                selectedKeys={filters.contact_id ? [filters.contact_id] : []}
                onSelectionChange={(keys) =>
                  setFilters({
                    ...filters,
                    contact_id: Array.from(keys)[0] as string,
                  })
                }
              >
                {contacts.map((contact) => (
                  <SelectItem key={contact.id}>{contact.name}</SelectItem>
                ))}
              </Select>

              <Input
                type="date"
                label="From Date"
                value={filters.date_from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
              />

              <Input
                type="date"
                label="To Date"
                value={filters.date_to || ""}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Communications Timeline */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {communications.map((communication) => (
            <Card
              key={communication.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar
                      icon={getTypeIcon(communication.type)}
                      className={`bg-${getTypeColor(
                        communication.type
                      )}-100 text-${getTypeColor(communication.type)}`}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {communication.subject ||
                            `${communication.type.replace("_", " ")} with ${
                              communication.contact?.name
                            }`}
                        </h3>
                        <Chip
                          color={getTypeColor(communication.type)}
                          variant="flat"
                          size="sm"
                          startContent={getTypeIcon(communication.type)}
                        >
                          {communication.type.replace("_", " ")}
                        </Chip>
                      </div>

                      {communication.content && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {communication.content}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Contact: {communication.contact?.name} (
                          {communication.contact?.email})
                        </span>
                        {communication.deal && (
                          <Badge
                            content={communication.deal.stage}
                            color="primary"
                            variant="flat"
                          >
                            <span>Deal: {communication.deal.title}</span>
                          </Badge>
                        )}
                        <span>
                          {formatDate(communication.communication_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        onPress={() => handleEdit(communication)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onPress={() => handleDelete(communication.id)}
                        className="text-danger"
                        color="danger"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          ))}

          {communications.length === 0 && (
            <Card>
              <CardBody className="p-12 text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  No communications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start logging your customer communications to track
                  interactions.
                </p>
                <Button color="primary" onPress={onOpen}>
                  Log Communication
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Create Communication Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>Log New Communication</ModalHeader>
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
                  <Input
                    {...field}
                    type="datetime-local"
                    label="Date & Time"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={submitting}>
                Log Communication
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Communication Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleEditSubmit(onEditSubmit)}>
            <ModalHeader>Edit Communication</ModalHeader>
            <ModalBody className="space-y-4">
              <Controller
                name="contact_id"
                control={editControl}
                rules={{ required: "Contact is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Contact"
                    placeholder="Select a contact"
                    isInvalid={!!editErrors.contact_id}
                    errorMessage={editErrors.contact_id?.message}
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
                control={editControl}
                rules={{ required: "Type is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Communication Type"
                    placeholder="Select type"
                    isInvalid={!!editErrors.type}
                    errorMessage={editErrors.type?.message}
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
                control={editControl}
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
                    {getContactDeals(selectedEditContactId).map((deal) => (
                      <SelectItem key={deal.id}>{deal.title}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="subject"
                control={editControl}
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
                control={editControl}
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
                control={editControl}
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

export default CommunicationsPage;
