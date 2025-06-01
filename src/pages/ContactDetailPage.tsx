import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useContact } from "../hooks/useContacts";
import { useContactRelatedData } from "../hooks/useContactRelatedData";
import { ContactForm } from "../components/ContactForm";
import { PersonaGenerator } from "../components/PersonaGenerator";
import { ObjectionHandler } from "../components/ObjectionHandler";

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  const {
    contact,
    loading: contactLoading,
    error: contactError,
    refresh,
  } = useContact(id || null);
  const {
    deals,
    communications,
    purchaseHistory,
    loading: relatedDataLoading,
  } = useContactRelatedData(id || null);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isObjectionHandlerOpen,
    onOpen: onObjectionHandlerOpen,
    onClose: onObjectionHandlerClose,
  } = useDisclosure();

  const handleFormSuccess = () => {
    onEditClose();
    refresh();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "lead":
        return "default";
      case "prospect":
        return "primary";
      case "negotiation":
        return "warning";
      case "closed-won":
        return "success";
      case "closed-lost":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "danger";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getCommunicationTypeColor = (type: string) => {
    switch (type) {
      case "phone_call":
        return "primary";
      case "email":
        return "secondary";
      case "meeting":
        return "success";
      case "note":
        return "default";
      default:
        return "default";
    }
  };

  if (contactLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (contactError || !contact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate("/contacts")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">
            Contact Not Found
          </h1>
        </div>
        <Card className="border-error bg-error-50">
          <CardBody>
            <p className="text-error-600">
              {contactError || "The contact you're looking for doesn't exist."}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const totalDealsValue = deals.reduce(
    (sum, deal) => sum + deal.monetary_value,
    0
  );
  const totalPurchases = purchaseHistory.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate("/contacts")}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {contact.name}
            </h1>
            {contact.job_title && (
              <p className="text-text-secondary mt-1">{contact.job_title}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="warning"
            variant="bordered"
            startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
            onPress={onObjectionHandlerOpen}
          >
            Handle Objection
          </Button>
          <Button
            color="primary"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={onEditOpen}
          >
            Edit Contact
          </Button>
        </div>
      </div>

      {/* Contact Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-primary">
              {deals.length}
            </div>
            <div className="text-sm text-text-secondary">Total Deals</div>
          </CardBody>
        </Card>
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totalDealsValue)}
            </div>
            <div className="text-sm text-text-secondary">Deals Value</div>
          </CardBody>
        </Card>
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-warning">
              {communications.length}
            </div>
            <div className="text-sm text-text-secondary">Communications</div>
          </CardBody>
        </Card>
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(totalPurchases)}
            </div>
            <div className="text-sm text-text-secondary">Total Purchases</div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="w-full"
      >
        <Tab key="overview" title="Overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Contact Information */}
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Contact Information
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <p className="text-text-primary">{contact.email}</p>
                  </div>
                </div>

                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Phone</p>
                      <p className="text-text-primary">{contact.phone}</p>
                    </div>
                  </div>
                )}

                {contact.company && (
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">Company</p>
                      <p className="text-text-primary">{contact.company}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Added</p>
                    <p className="text-text-primary">
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Recent Activity
                </h3>
              </CardHeader>
              <CardBody>
                {relatedDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {communications.slice(0, 3).map((comm) => (
                      <div
                        key={comm.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-background"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-text-secondary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {comm.subject ||
                              `${comm.type.replace("_", " ")} communication`}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatDate(comm.communication_date)}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={getCommunicationTypeColor(comm.type)}
                        >
                          {comm.type.replace("_", " ")}
                        </Chip>
                      </div>
                    ))}
                    {communications.length === 0 && (
                      <p className="text-text-secondary text-center py-4">
                        No recent activity
                      </p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="deals" title="Deals">
          <div className="mt-6">
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Associated Deals
                </h3>
              </CardHeader>
              <CardBody>
                {relatedDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : deals.length > 0 ? (
                  <div className="space-y-4">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {deal.title}
                          </h4>
                          <Chip size="sm" color={getStageColor(deal.stage)}>
                            {deal.stage.replace("-", " ")}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>{formatCurrency(deal.monetary_value)}</span>
                          </div>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {formatDate(deal.expected_close_date)}
                              </span>
                            </div>
                          )}
                          <span>
                            {deal.probability_percentage}% probability
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    No deals associated with this contact
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="communications" title="Communications">
          <div className="mt-6">
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Communication History
                </h3>
              </CardHeader>
              <CardBody>
                {relatedDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : communications.length > 0 ? (
                  <div className="space-y-4">
                    {communications.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {comm.subject ||
                              `${comm.type.replace("_", " ")} communication`}
                          </h4>
                          <Chip
                            size="sm"
                            color={getCommunicationTypeColor(comm.type)}
                          >
                            {comm.type.replace("_", " ")}
                          </Chip>
                        </div>
                        {comm.content && (
                          <p className="text-text-secondary mb-2">
                            {comm.content}
                          </p>
                        )}
                        <p className="text-xs text-text-secondary">
                          {formatDate(comm.communication_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    No communications recorded
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="purchases" title="Purchase History">
          <div className="mt-6">
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Purchase History
                </h3>
              </CardHeader>
              <CardBody>
                {relatedDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : purchaseHistory.length > 0 ? (
                  <div className="space-y-4">
                    {purchaseHistory.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {purchase.product_service}
                          </h4>
                          <Chip
                            size="sm"
                            color={getStatusColor(purchase.status)}
                          >
                            {purchase.status}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>{formatCurrency(purchase.amount)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(purchase.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    No purchase history available
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="ai-persona" title="AI Persona">
          <div className="mt-6">
            <PersonaGenerator
              contact={contact}
              deals={deals}
              communications={communications}
              purchaseHistory={purchaseHistory}
            />
          </div>
        </Tab>
      </Tabs>

      {/* Objection Handler Modal */}
      <ObjectionHandler
        isOpen={isObjectionHandlerOpen}
        onClose={onObjectionHandlerClose}
        context={{
          contact: contact,
          industry: contact.company ? undefined : undefined, // Could be enhanced with industry detection
        }}
      />

      {/* Edit Contact Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Contact</ModalHeader>
          <ModalBody>
            <ContactForm contact={contact} onSuccess={handleFormSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ContactDetailPage;
