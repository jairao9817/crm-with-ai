import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
  Progress,
} from "@heroui/react";
import {
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { aiService } from "../services/aiService";
import type {
  WinLossExplainerInput,
  WinLossExplainerResponse,
  Deal,
  Task,
  Communication,
  PurchaseHistory,
  Contact,
} from "../types";

interface WinLossExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  context?: {
    tasks?: Task[];
    communications?: Communication[];
    purchaseHistory?: PurchaseHistory[];
    contact?: Contact;
  };
}

export const WinLossExplainer: React.FC<WinLossExplainerProps> = ({
  isOpen,
  onClose,
  deal,
  context,
}) => {
  const [analysis, setAnalysis] = useState<WinLossExplainerResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosedDeal =
    deal.stage === "closed-won" || deal.stage === "closed-lost";
  const outcome = deal.stage === "closed-won" ? "won" : "lost";

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const input: WinLossExplainerInput = {
        deal,
        context,
      };

      const aiAnalysis = await aiService.generateWinLossExplanation(input);
      setAnalysis(aiAnalysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate analysis"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnalysis(null);
    setError(null);
    onClose();
  };

  const getOutcomeIcon = (outcome: string) => {
    return outcome === "won" ? (
      <CheckCircleIcon className="w-5 h-5" />
    ) : (
      <XCircleIcon className="w-5 h-5" />
    );
  };

  const getOutcomeColor = (outcome: string) => {
    return outcome === "won" ? "success" : "danger";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "danger";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <ChartBarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Win-Loss Analysis</h2>
          </div>
          <p className="text-sm text-text-secondary font-normal">
            AI-powered analysis of why this deal was {outcome}
          </p>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Deal Summary */}
          <Card className="bg-background border border-border">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4" />
                  Deal Summary
                </h4>
                <Chip
                  size="sm"
                  color={getOutcomeColor(outcome)}
                  startContent={getOutcomeIcon(outcome)}
                >
                  {outcome.toUpperCase()}
                </Chip>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Deal:</span> {deal.title}
                </div>
                <div>
                  <span className="font-medium">Value:</span> $
                  {deal.monetary_value.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Probability:</span>{" "}
                  {deal.probability_percentage}%
                </div>
                <div>
                  <span className="font-medium">Stage:</span>{" "}
                  {deal.stage.replace("-", " ")}
                </div>
                {context?.contact && (
                  <>
                    <div>
                      <span className="font-medium">Customer:</span>{" "}
                      {context.contact.name}
                    </div>
                    <div>
                      <span className="font-medium">Company:</span>{" "}
                      {context.contact.company || "Not specified"}
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Generate Analysis Button */}
          {!analysis && !loading && !error && (
            <div className="text-center py-8">
              <Button
                color="primary"
                size="lg"
                startContent={<ChartBarIcon className="w-5 h-5" />}
                onPress={handleGenerateAnalysis}
              >
                Generate AI Analysis
              </Button>
              <p className="text-sm text-text-secondary mt-2">
                Analyze deal data to understand why it was {outcome}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="bg-primary-50 border border-primary-200">
              <CardBody className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <Spinner size="sm" color="primary" />
                  <span className="text-primary-700">
                    Analyzing deal data and generating insights...
                  </span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-danger-50 border border-danger-200">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-danger-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="mt-3"
                  onPress={handleGenerateAnalysis}
                >
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Confidence Score */}
              <Card className="bg-background border border-border">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-text-primary">
                      Analysis Confidence
                    </h4>
                    <Chip
                      size="sm"
                      color={getConfidenceColor(analysis.confidence_score)}
                    >
                      {analysis.confidence_score}%
                    </Chip>
                  </div>
                  <Progress
                    value={analysis.confidence_score}
                    color={getConfidenceColor(analysis.confidence_score)}
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Based on available data quality and completeness
                  </p>
                </CardBody>
              </Card>

              {/* Main Explanation */}
              <Card className="bg-background border border-border">
                <CardBody className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    Why This Deal Was{" "}
                    {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {analysis.explanation}
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Key Factors */}
              <Card className="bg-background border border-border">
                <CardBody className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <LightBulbIcon className="w-4 h-4" />
                    Key Contributing Factors
                  </h4>
                  <div className="space-y-2">
                    {analysis.key_factors.map((factor, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-surface"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-text-secondary text-sm">{factor}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Lessons Learned */}
              <Card className="bg-background border border-border">
                <CardBody className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" />
                    Lessons Learned
                  </h4>
                  <div className="space-y-2">
                    {analysis.lessons_learned.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-surface"
                      >
                        <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                        <p className="text-text-secondary text-sm">{lesson}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Recommendations */}
              <Card className="bg-background border border-border">
                <CardBody className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-4 h-4" />
                    Recommendations for Future Deals
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded-lg bg-surface"
                      >
                        <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                        <p className="text-text-secondary text-sm">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Analysis Metadata */}
              <div className="text-xs text-text-secondary text-center">
                Analysis generated on {formatDate(analysis.generated_at)}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Close
          </Button>
          {analysis && (
            <Button
              color="secondary"
              onPress={() => {
                setAnalysis(null);
                setError(null);
              }}
              startContent={<ChartBarIcon className="w-4 h-4" />}
            >
              Generate New Analysis
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
