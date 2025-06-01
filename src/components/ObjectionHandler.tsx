import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { aiService } from "../services/aiService";
import { ObjectionResponseService } from "../services/objectionResponseService";
import type {
  ObjectionHandlerInput,
  ObjectionHandlerResponse,
  Contact,
  Deal,
  Communication,
} from "../types";

interface ObjectionHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    contact?: Contact;
    deal?: Deal;
    communication?: Communication;
    industry?: string;
    product_service?: string;
  };
}

export const ObjectionHandler: React.FC<ObjectionHandlerProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [objection, setObjection] = useState("");
  const [response, setResponse] = useState<ObjectionHandlerResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [objectionHistory, setObjectionHistory] = useState<
    ObjectionHandlerResponse[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTab, setSelectedTab] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");

  // Load objection response history when modal opens
  useEffect(() => {
    if (isOpen) {
      loadObjectionHistory();
    }
  }, [isOpen]);

  const loadObjectionHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await ObjectionResponseService.getObjectionResponses();
      setObjectionHistory(history);
    } catch (err) {
      console.error("Failed to load objection history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const searchObjections = async (term: string) => {
    if (!term.trim()) {
      loadObjectionHistory();
      return;
    }

    try {
      setLoadingHistory(true);
      const results = await ObjectionResponseService.searchByObjection(term);
      setObjectionHistory(results);
    } catch (err) {
      console.error("Failed to search objections:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!objection.trim()) {
      setError("Please enter a customer objection");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const input: ObjectionHandlerInput = {
        objection: objection.trim(),
        context,
      };

      const aiResponse = await aiService.generateObjectionResponse(input);
      setResponse(aiResponse);
      // Refresh history to include the new response
      await loadObjectionHistory();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate response"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObjection("");
    setResponse(null);
    setError(null);
    setSearchTerm("");
    setSelectedTab("current");
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "professional":
        return "primary";
      case "empathetic":
        return "secondary";
      case "confident":
        return "success";
      case "consultative":
        return "warning";
      default:
        return "default";
    }
  };

  const renderObjectionResponse = (
    objectionResponse: ObjectionHandlerResponse,
    isHistorical = false
  ) => (
    <Card
      className={`${
        isHistorical
          ? "bg-background border border-border"
          : "bg-success-50 border border-success-200"
      }`}
    >
      <CardBody className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4
            className={`text-lg font-semibold ${
              isHistorical ? "text-text-primary" : "text-success-800"
            } flex items-center gap-2`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            {isHistorical ? "Previous Response" : "Suggested Response"}
          </h4>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={getToneColor(objectionResponse.tone) as any}
              variant="flat"
            >
              {objectionResponse.tone}
            </Chip>
            <Button
              size="sm"
              variant="flat"
              color={isHistorical ? "primary" : "success"}
              startContent={<ClipboardDocumentIcon className="w-4 h-4" />}
              onPress={() =>
                copyToClipboard(objectionResponse.suggested_response)
              }
            >
              Copy
            </Button>
          </div>
        </div>

        {isHistorical && (
          <div className="p-3 rounded-lg bg-surface border border-border">
            <p className="text-sm font-medium text-text-primary mb-1">
              Original Objection:
            </p>
            <p className="text-text-secondary text-sm italic">
              "{objectionResponse.objection}"
            </p>
          </div>
        )}

        <div
          className={`${
            isHistorical ? "bg-surface" : "bg-white"
          } p-4 rounded-lg border ${
            isHistorical ? "border-border" : "border-success-300"
          }`}
        >
          <p
            className={`${
              isHistorical ? "text-text-primary" : "text-gray-800"
            } leading-relaxed whitespace-pre-wrap`}
          >
            {objectionResponse.suggested_response}
          </p>
        </div>

        <Divider />

        <div className="space-y-3">
          <h5
            className={`font-semibold ${
              isHistorical ? "text-text-primary" : "text-success-800"
            }`}
          >
            Strategy: {objectionResponse.response_strategy}
          </h5>

          <div>
            <h6
              className={`font-medium ${
                isHistorical ? "text-text-secondary" : "text-success-700"
              } mb-2`}
            >
              Key Points to Emphasize:
            </h6>
            <ul className="space-y-1">
              {objectionResponse.key_points.map((point, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    isHistorical ? "text-text-secondary" : "text-gray-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHistorical ? "bg-primary" : "bg-success-500"
                    } mt-2 flex-shrink-0`}
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`text-xs ${
            isHistorical ? "text-text-secondary" : "text-success-600"
          }`}
        >
          Generated at{" "}
          {new Date(objectionResponse.generated_at).toLocaleString()}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-primary" />
            <span>AI Objection Handler</span>
            <Chip size="sm" color="warning" variant="flat">
              AI-powered
            </Chip>
            {objectionHistory.length > 0 && (
              <Chip size="sm" variant="flat" color="primary">
                {objectionHistory.length} responses
              </Chip>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            className="w-full"
          >
            <Tab
              key="current"
              title={
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Handle Objection
                </div>
              }
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Customer Objection
                    </label>
                    <textarea
                      value={objection}
                      onChange={(e) => setObjection(e.target.value)}
                      placeholder="Enter the customer's objection or concern..."
                      className="w-full p-3 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  {context && (
                    <div className="p-4 bg-surface rounded-lg border border-border">
                      <h4 className="text-sm font-semibold text-text-primary mb-2">
                        Context Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {context.contact && (
                          <div>
                            <span className="text-text-secondary">
                              Contact:
                            </span>
                            <span className="ml-2 text-text-primary">
                              {context.contact.name}
                            </span>
                          </div>
                        )}
                        {context.deal && (
                          <div>
                            <span className="text-text-secondary">Deal:</span>
                            <span className="ml-2 text-text-primary">
                              {context.deal.title}
                            </span>
                          </div>
                        )}
                        {context.industry && (
                          <div>
                            <span className="text-text-secondary">
                              Industry:
                            </span>
                            <span className="ml-2 text-text-primary">
                              {context.industry}
                            </span>
                          </div>
                        )}
                        {context.product_service && (
                          <div>
                            <span className="text-text-secondary">
                              Product/Service:
                            </span>
                            <span className="ml-2 text-text-primary">
                              {context.product_service}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      color="primary"
                      size="lg"
                      onPress={handleSubmit}
                      isLoading={loading}
                      isDisabled={!objection.trim()}
                      startContent={
                        !loading && <LightBulbIcon className="w-4 h-4" />
                      }
                    >
                      {loading ? "Generating Response..." : "Get AI Response"}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-danger-600" />
                      <p className="text-danger-600">{error}</p>
                    </div>
                  </div>
                )}

                {response && renderObjectionResponse(response)}
              </div>
            </Tab>

            {objectionHistory.length > 0 && (
              <Tab
                key="history"
                title={
                  <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="w-4 h-4" />
                    History ({objectionHistory.length})
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            searchObjections(e.target.value);
                          }}
                          placeholder="Search previous objections..."
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setSearchTerm("");
                        loadObjectionHistory();
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : objectionHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-secondary">
                        {searchTerm
                          ? "No objections found matching your search."
                          : "No objection responses found."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {objectionHistory.map((objectionResponse, index) => (
                        <div key={objectionResponse.id} className="relative">
                          <div className="absolute -left-2 top-4 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {objectionHistory.length - index}
                            </span>
                          </div>
                          <div className="ml-6">
                            {renderObjectionResponse(objectionResponse, true)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Tab>
            )}
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
