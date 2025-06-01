import React, { useState, useEffect } from "react";
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
  Progress,
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
  ClipboardDocumentListIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useDeal } from "../hooks/useDeals";
import { useDealRelatedData } from "../hooks/useDealRelatedData";
import { DealForm } from "../components/DealForm";
import { DealCloseModal } from "../components/DealCloseModal";
import { ObjectionHandler } from "../components/ObjectionHandler";
import { WinLossExplainer } from "../components/WinLossExplainer";
import type { DealStage } from "../types/index";
import { DealService } from "../services/dealService";

const stageConfig: Record<
  DealStage,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
    progress: number;
  }
> = {
  lead: { label: "Lead", color: "default", progress: 20 },
  prospect: { label: "Prospect", color: "primary", progress: 40 },
  negotiation: { label: "Negotiation", color: "warning", progress: 70 },
  "closed-won": { label: "Closed Won", color: "success", progress: 100 },
  "closed-lost": { label: "Closed Lost", color: "danger", progress: 0 },
};

const DealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  const {
    deal,
    loading: dealLoading,
    error: dealError,
    refresh,
  } = useDeal(id || null);
  const {
    tasks,
    communications,
    purchaseHistory,
    loading: relatedDataLoading,
  } = useDealRelatedData(id || null);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isCloseModalOpen,
    onOpen: onCloseModalOpen,
    onClose: onCloseModalClose,
  } = useDisclosure();

  const {
    isOpen: isObjectionHandlerOpen,
    onOpen: onObjectionHandlerOpen,
    onClose: onObjectionHandlerClose,
  } = useDisclosure();

  const {
    isOpen: isWinLossExplainerOpen,
    onOpen: onWinLossExplainerOpen,
    onClose: onWinLossExplainerClose,
  } = useDisclosure();

  const [isAICoachOpen, setAICoachOpen] = useState(false);
  const [aiCoachLoading, setAICoachLoading] = useState(false);
  const [aiCoachError, setAICoachError] = useState<string | null>(null);
  const [aiCoachSuggestions, setAICoachSuggestions] = useState<string | null>(
    null
  );
  const [aiCoachHistory, setAICoachHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load existing AI coach suggestions when deal changes
  useEffect(() => {
    if (deal?.id) {
      loadAICoachHistory();
    }
  }, [deal?.id]);

  const loadAICoachHistory = async () => {
    if (!deal?.id) return;

    try {
      setLoadingHistory(true);
      const { DealCoachService } = await import("../services/dealCoachService");
      const history = await DealCoachService.getSuggestionsByDeal(deal.id);
      setAICoachHistory(history);

      // Set the latest suggestion as current if no new one is being generated
      if (history.length > 0 && !aiCoachSuggestions) {
        setAICoachSuggestions(history[0].suggestions);
      }
    } catch (error) {
      console.error("Failed to load AI coach history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFormSuccess = () => {
    onEditClose();
    refresh();
  };

  const handleCloseSuccess = () => {
    onCloseModalClose();
    refresh();
  };

  const handleCloseDeal = () => {
    if (
      deal &&
      deal.stage !== "closed-won" &&
      deal.contact_id &&
      deal.monetary_value > 0
    ) {
      onCloseModalOpen();
    }
  };

  const handleOpenAICoach = () => {
    setAICoachOpen(true);
    setAICoachLoading(false);
    setAICoachError(null);
    // Don't reset suggestions - keep showing the latest one
    loadAICoachHistory();
  };

  const handleGenerateAICoach = async () => {
    setAICoachLoading(true);
    setAICoachError(null);
    setAICoachSuggestions(null);
    try {
      const suggestions = await DealService.getAIDealCoachSuggestions(deal, {
        tasks,
        communications,
        purchaseHistory,
      });
      setAICoachSuggestions(suggestions);
      // Refresh history to include the new suggestion
      await loadAICoachHistory();
    } catch (err: any) {
      setAICoachError(err.message || "Failed to get AI suggestions.");
    } finally {
      setAICoachLoading(false);
    }
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "overdue":
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

  const isClosedDeal =
    deal?.stage === "closed-won" || deal?.stage === "closed-lost";

  if (dealLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onPress={() => navigate("/deals")}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">
            Deal Not Found
          </h1>
        </div>
        <Card className="border-error bg-error-50">
          <CardBody>
            <p className="text-error-600">
              {dealError || "The deal you're looking for doesn't exist."}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const stageInfo = stageConfig[deal.stage];
  const totalPurchases = purchaseHistory.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const overdueTasks = tasks.filter((task) => task.status === "overdue").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" onPress={() => navigate("/deals")}>
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {deal.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Chip color={stageInfo.color} variant="flat">
                {stageInfo.label}
              </Chip>
              <span className="text-xl font-bold text-success">
                {formatCurrency(deal.monetary_value)}
              </span>
              <span className="text-sm text-text-secondary">
                {deal.probability_percentage}% probability
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Win-Loss Explainer Button - Only show for closed deals */}
          {isClosedDeal && (
            <Button
              color="secondary"
              variant="bordered"
              startContent={<ChartBarIcon className="w-4 h-4" />}
              onPress={onWinLossExplainerOpen}
            >
              Why Did We {deal.stage === "closed-won" ? "Win" : "Lose"}?
            </Button>
          )}
          {/* AI Objection Handler Button */}
          <Button
            color="warning"
            variant="bordered"
            startContent={<ExclamationTriangleIcon className="w-4 h-4" />}
            onPress={onObjectionHandlerOpen}
          >
            Handle Objection
          </Button>
          {/* AI Deal Coach Button */}
          <Button
            color="secondary"
            startContent={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
            onPress={handleOpenAICoach}
            variant="bordered"
          >
            AI Deal Coach
          </Button>
          {deal.stage !== "closed-won" &&
            deal.contact_id &&
            deal.monetary_value > 0 && (
              <Button
                color="success"
                startContent={<CheckCircleIcon className="w-4 h-4" />}
                onPress={handleCloseDeal}
              >
                Close as Won
              </Button>
            )}
          <Button
            color="primary"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={onEditOpen}
          >
            Edit Deal
          </Button>
        </div>
      </div>

      {/* Deal Progress */}
      <Card className="bg-surface border border-border">
        <CardBody>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text-primary">
                Deal Progress
              </h3>
              <span className="text-sm text-text-secondary">
                {stageInfo.progress}% Complete
              </span>
            </div>
            <Progress
              value={stageInfo.progress}
              color={stageInfo.color}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Lead</span>
              <span>Prospect</span>
              <span>Negotiation</span>
              <span>Closed</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Deal Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-primary">
              {tasks.length}
            </div>
            <div className="text-sm text-text-secondary">Total Tasks</div>
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
        <Card className="bg-surface border border-border">
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-success">
              {completedTasks}
            </div>
            <div className="text-sm text-text-secondary">Completed Tasks</div>
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
            {/* Deal Information */}
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Deal Information
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Value</p>
                    <p className="text-text-primary font-semibold">
                      {formatCurrency(deal.monetary_value)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Probability</p>
                    <p className="text-text-primary">
                      {deal.probability_percentage}%
                    </p>
                  </div>
                </div>

                {deal.expected_close_date && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-sm text-text-secondary">
                        Expected Close Date
                      </p>
                      <p className="text-text-primary">
                        {formatDate(deal.expected_close_date)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="text-sm text-text-secondary">Created</p>
                    <p className="text-text-primary">
                      {formatDate(deal.created_at)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contact Information */}
            <Card className="bg-surface border border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Contact Information
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {deal.contact ? (
                  <>
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-text-secondary" />
                      <div>
                        <p className="text-sm text-text-secondary">Name</p>
                        <p className="text-text-primary">{deal.contact.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-text-secondary" />
                      <div>
                        <p className="text-sm text-text-secondary">Email</p>
                        <p className="text-text-primary">
                          {deal.contact.email}
                        </p>
                      </div>
                    </div>

                    {deal.contact.phone && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-secondary">Phone</p>
                          <p className="text-text-primary">
                            {deal.contact.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {deal.contact.company && (
                      <div className="flex items-center gap-3">
                        <BuildingOfficeIcon className="w-5 h-5 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-secondary">Company</p>
                          <p className="text-text-primary">
                            {deal.contact.company}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-text-secondary">
                    No contact associated with this deal
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-surface border border-border lg:col-span-2">
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
                    {[...communications, ...tasks].slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-background"
                      >
                        {"type" in item ? (
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <ClipboardDocumentListIcon className="w-4 h-4 text-text-secondary" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {"type" in item
                              ? item.subject ||
                                `${item.type.replace("_", " ")} communication`
                              : item.title}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {"type" in item
                              ? formatDate(item.communication_date)
                              : item.due_date
                              ? formatDate(item.due_date)
                              : "No due date"}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={
                            "type" in item
                              ? getCommunicationTypeColor(item.type)
                              : getTaskStatusColor(item.status)
                          }
                        >
                          {"type" in item
                            ? item.type.replace("_", " ")
                            : item.status}
                        </Chip>
                      </div>
                    ))}
                    {communications.length === 0 && tasks.length === 0 && (
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

        <Tab key="tasks" title="Tasks">
          <div className="mt-6">
            <Card className="bg-surface border border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Associated Tasks
                  </h3>
                  <div className="flex gap-2 text-sm">
                    <span className="text-success">
                      {completedTasks} completed
                    </span>
                    <span className="text-warning">{pendingTasks} pending</span>
                    <span className="text-danger">{overdueTasks} overdue</span>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {relatedDataLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {task.title}
                          </h4>
                          <Chip
                            size="sm"
                            color={getTaskStatusColor(task.status)}
                          >
                            {task.status}
                          </Chip>
                        </div>
                        {task.description && (
                          <p className="text-text-secondary mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Due: {formatDate(task.due_date)}</span>
                            </div>
                          )}
                          <span>Created: {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    No tasks associated with this deal
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
      </Tabs>

      {/* Edit Deal Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Deal</ModalHeader>
          <ModalBody>
            <DealForm deal={deal} onSuccess={handleFormSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Deal Close Modal */}
      {deal && (
        <DealCloseModal
          isOpen={isCloseModalOpen}
          onClose={onCloseModalClose}
          deal={deal}
          onSuccess={handleCloseSuccess}
        />
      )}

      {/* Win-Loss Explainer Modal */}
      {deal && isClosedDeal && (
        <WinLossExplainer
          isOpen={isWinLossExplainerOpen}
          onClose={onWinLossExplainerClose}
          deal={deal}
          context={{
            tasks,
            communications,
            purchaseHistory,
            contact: deal.contact,
          }}
        />
      )}

      {/* Objection Handler Modal */}
      <ObjectionHandler
        isOpen={isObjectionHandlerOpen}
        onClose={onObjectionHandlerClose}
        context={{
          contact: deal.contact,
          deal: deal,
          product_service: deal.title,
        }}
      />

      {/* AI Deal Coach Modal */}
      <Modal
        isOpen={isAICoachOpen}
        onClose={() => setAICoachOpen(false)}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
              <span>AI Deal Coach</span>
              <Chip size="sm" color="warning" variant="flat">
                AI-generated
              </Chip>
              {aiCoachHistory.length > 0 && (
                <Chip size="sm" variant="flat" color="primary">
                  {aiCoachHistory.length} suggestions
                </Chip>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            <Tabs className="w-full">
              <Tab
                key="current"
                title={
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Current Suggestions
                  </div>
                }
              >
                <div className="space-y-4">
                  {!aiCoachSuggestions && !aiCoachLoading && !aiCoachError && (
                    <div className="text-center py-8">
                      <Button
                        color="primary"
                        size="lg"
                        onPress={handleGenerateAICoach}
                        startContent={
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        }
                      >
                        Generate AI Suggestions
                      </Button>
                      <p className="text-text-secondary text-sm mt-2">
                        Get personalized recommendations to move this deal
                        forward
                      </p>
                    </div>
                  )}

                  {aiCoachLoading && (
                    <div className="flex justify-center items-center py-8">
                      <Spinner size="lg" color="primary" />
                      <span className="ml-3">
                        Analyzing deal and generating suggestions...
                      </span>
                    </div>
                  )}

                  {aiCoachError && (
                    <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
                      <p className="text-danger-600">{aiCoachError}</p>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="mt-2"
                        onPress={handleGenerateAICoach}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {aiCoachSuggestions && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-success-50 border border-success-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-success-800">
                            AI Recommendations
                          </h4>
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={handleGenerateAICoach}
                            isLoading={aiCoachLoading}
                          >
                            Generate New
                          </Button>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-line text-text-primary text-base leading-relaxed">
                            {aiCoachSuggestions}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Tab>

              {aiCoachHistory.length > 0 && (
                <Tab
                  key="history"
                  title={
                    <div className="flex items-center gap-2">
                      <ArchiveBoxIcon className="w-4 h-4" />
                      History ({aiCoachHistory.length})
                    </div>
                  }
                >
                  <div className="space-y-4">
                    {loadingHistory ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" color="primary" />
                      </div>
                    ) : (
                      aiCoachHistory.map((suggestion, index) => (
                        <Card
                          key={suggestion.id}
                          className="bg-background border border-border"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between w-full">
                              <h4 className="text-sm font-semibold text-text-primary">
                                Suggestion #{aiCoachHistory.length - index}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(
                                  suggestion.generated_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {index === 0 && (
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                  >
                                    Latest
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardBody className="pt-0">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-line text-text-secondary text-sm leading-relaxed">
                                {suggestion.suggestions}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </div>
                </Tab>
              )}
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DealDetailPage;
