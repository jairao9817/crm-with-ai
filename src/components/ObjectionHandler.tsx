import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { aiService } from "../services/aiService";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Objection Handler</h2>
          </div>
          <p className="text-sm text-text-secondary font-normal">
            Get AI-powered suggestions to handle customer objections effectively
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Context Information */}
          {context && (
            <Card className="bg-background border border-border">
              <CardBody className="p-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-4 h-4" />
                  Context Information
                </h4>
                <div className="space-y-2 text-sm">
                  {context.contact && (
                    <div>
                      <span className="font-medium">Customer:</span>{" "}
                      {context.contact.name}
                      {context.contact.company &&
                        ` (${context.contact.company})`}
                    </div>
                  )}
                  {context.deal && (
                    <div>
                      <span className="font-medium">Deal:</span>{" "}
                      {context.deal.title} - $
                      {context.deal.monetary_value.toLocaleString()} (
                      {context.deal.stage})
                    </div>
                  )}
                  {context.communication && (
                    <div>
                      <span className="font-medium">Communication:</span>{" "}
                      {context.communication.type.replace("_", " ")}
                      {context.communication.subject &&
                        ` - ${context.communication.subject}`}
                    </div>
                  )}
                  {context.industry && (
                    <div>
                      <span className="font-medium">Industry:</span>{" "}
                      {context.industry}
                    </div>
                  )}
                  {context.product_service && (
                    <div>
                      <span className="font-medium">Product/Service:</span>{" "}
                      {context.product_service}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Objection Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Customer Objection
            </label>
            <Textarea
              placeholder="Paste or type the customer's objection here..."
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              minRows={4}
              maxRows={8}
              className="w-full"
            />
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-danger-50 border border-danger-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-danger-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="bg-primary-50 border border-primary-200">
              <CardBody className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <Spinner size="sm" color="primary" />
                  <span className="text-primary-700">
                    Generating AI response...
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* AI Response */}
          {response && (
            <Card className="bg-success-50 border border-success-200">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-success-800 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Suggested Response
                  </h4>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={getToneColor(response.tone) as any}
                      variant="flat"
                    >
                      {response.tone}
                    </Chip>
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      }
                      onPress={() =>
                        copyToClipboard(response.suggested_response)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-success-300">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {response.suggested_response}
                  </p>
                </div>

                <Divider />

                <div className="space-y-3">
                  <h5 className="font-semibold text-success-800">
                    Strategy: {response.response_strategy}
                  </h5>

                  <div>
                    <h6 className="font-medium text-success-700 mb-2">
                      Key Points to Emphasize:
                    </h6>
                    <ul className="space-y-1">
                      {response.key_points.map((point, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-xs text-success-600">
                  Generated at{" "}
                  {new Date(response.generated_at).toLocaleString()}
                </div>
              </CardBody>
            </Card>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Close
          </Button>
          {!response && (
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={!objection.trim() || loading}
              startContent={
                !loading ? (
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                ) : undefined
              }
            >
              {loading ? "Generating..." : "Get AI Response"}
            </Button>
          )}
          {response && (
            <Button
              color="secondary"
              onPress={() => {
                setResponse(null);
                setError(null);
              }}
              startContent={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
            >
              Try Another Objection
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
