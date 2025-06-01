import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
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
  ChartBarIcon,
  LightBulbIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  ClockIcon,
  TrophyIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { aiService } from "../services/aiService";
import { WinLossAnalysisService } from "../services/winLossAnalysisService";
import type {
  WinLossExplainerInput,
  WinLossExplainerResponse,
  Deal,
  Task,
  Communication,
  PurchaseHistory,
} from "../types";

interface WinLossExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  context?: {
    tasks?: Task[];
    communications?: Communication[];
    purchaseHistory?: PurchaseHistory[];
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
  const [analysisHistory, setAnalysisHistory] = useState<
    WinLossExplainerResponse[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTab, setSelectedTab] = useState("current");

  // Load analysis history when modal opens
  useEffect(() => {
    if (isOpen && deal?.id) {
      loadAnalysisHistory();
    }
  }, [isOpen, deal?.id]);

  const loadAnalysisHistory = async () => {
    if (!deal?.id) return;

    try {
      setLoadingHistory(true);
      const history = await WinLossAnalysisService.getAnalysesByDeal(deal.id);
      setAnalysisHistory(history);

      // Set the latest analysis as current if no new one is being generated
      if (history.length > 0 && !analysis) {
        setAnalysis(history[0]);
      }
    } catch (err) {
      console.error("Failed to load analysis history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const input: WinLossExplainerInput = {
        deal,
        context,
      };

      const aiResponse = await aiService.generateWinLossExplanation(input);
      setAnalysis(aiResponse);
      // Refresh history to include the new analysis
      await loadAnalysisHistory();
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

  const getOutcomeIcon = (outcome: string) => {
    return outcome === "won" ? (
      <TrophyIcon className="w-5 h-5 text-success-600" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-danger-600" />
    );
  };

  const getOutcomeColor = (outcome: string) => {
    return outcome === "won" ? "success" : "danger";
  };

  const renderAnalysis = (
    analysisData: WinLossExplainerResponse,
    isHistorical = false
  ) => (
    <Card
      className={`${
        isHistorical
          ? "bg-background border border-border"
          : "bg-primary-50 border border-primary-200"
      }`}
    >
      <CardBody className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4
            className={`text-lg font-semibold ${
              isHistorical ? "text-text-primary" : "text-primary-800"
            } flex items-center gap-2`}
          >
            <ChartBarIcon className="w-5 h-5" />
            {isHistorical ? "Previous Analysis" : "Win-Loss Analysis"}
          </h4>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={getOutcomeColor(analysisData.outcome) as any}
              variant="flat"
              startContent={getOutcomeIcon(analysisData.outcome)}
            >
              {analysisData.outcome.toUpperCase()}
            </Chip>
            <Button
              size="sm"
              variant="flat"
              color={isHistorical ? "primary" : "primary"}
              startContent={<ClipboardDocumentIcon className="w-4 h-4" />}
              onPress={() => copyToClipboard(analysisData.explanation)}
            >
              Copy
            </Button>
          </div>
        </div>

        <div
          className={`${
            isHistorical ? "bg-surface" : "bg-white"
          } p-4 rounded-lg border ${
            isHistorical ? "border-border" : "border-primary-300"
          }`}
        >
          <p
            className={`${
              isHistorical ? "text-text-primary" : "text-gray-800"
            } leading-relaxed whitespace-pre-wrap`}
          >
            {analysisData.explanation}
          </p>
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5
              className={`font-semibold ${
                isHistorical ? "text-text-primary" : "text-primary-800"
              } mb-2`}
            >
              Key Factors
            </h5>
            <ul className="space-y-1">
              {analysisData.key_factors.map((factor, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    isHistorical ? "text-text-secondary" : "text-gray-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHistorical ? "bg-primary" : "bg-primary-500"
                    } mt-2 flex-shrink-0`}
                  />
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5
              className={`font-semibold ${
                isHistorical ? "text-text-primary" : "text-primary-800"
              } mb-2`}
            >
              Lessons Learned
            </h5>
            <ul className="space-y-1">
              {analysisData.lessons_learned.map((lesson, index) => (
                <li
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    isHistorical ? "text-text-secondary" : "text-gray-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHistorical ? "bg-warning" : "bg-warning-500"
                    } mt-2 flex-shrink-0`}
                  />
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`text-xs ${
            isHistorical ? "text-text-secondary" : "text-primary-600"
          }`}
        >
          Generated at {new Date(analysisData.generated_at).toLocaleString()}
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
            <ChartBarIcon className="w-5 h-5 text-primary" />
            <span>Win-Loss Analysis</span>
            <Chip size="sm" color="warning" variant="flat">
              AI-powered
            </Chip>
            {analysisHistory.length > 0 && (
              <Chip size="sm" variant="flat" color="primary">
                {analysisHistory.length} analyses
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
                  <ChartBarIcon className="w-4 h-4" />
                  Current Analysis
                </div>
              }
            >
              <div className="space-y-6">
                <div className="p-4 bg-surface rounded-lg border border-border">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">
                    Deal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Deal:</span>
                      <span className="ml-2 text-text-primary">
                        {deal.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Value:</span>
                      <span className="ml-2 text-text-primary">
                        ${deal.monetary_value.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Stage:</span>
                      <span className="ml-2 text-text-primary">
                        {deal.stage}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Close Date:</span>
                      <span className="ml-2 text-text-primary">
                        {deal.close_date
                          ? new Date(deal.close_date).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                  </div>
                </div>

                {!analysis && !loading && !error && (
                  <div className="text-center py-8">
                    <Button
                      color="primary"
                      size="lg"
                      onPress={handleAnalyze}
                      startContent={<ChartBarIcon className="w-4 h-4" />}
                    >
                      Generate Analysis
                    </Button>
                    <p className="text-text-secondary text-sm mt-2">
                      Get AI insights into why this deal was won or lost
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" color="primary" />
                    <span className="ml-3">Analyzing deal outcome...</span>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-danger-600" />
                      <p className="text-danger-600">{error}</p>
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="mt-2"
                      onPress={handleAnalyze}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {analysis && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-text-primary">
                        Analysis Results
                      </h3>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={handleAnalyze}
                        isLoading={loading}
                      >
                        Generate New
                      </Button>
                    </div>
                    {renderAnalysis(analysis)}
                  </div>
                )}
              </div>
            </Tab>

            {analysisHistory.length > 0 && (
              <Tab
                key="history"
                title={
                  <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="w-4 h-4" />
                    History ({analysisHistory.length})
                  </div>
                }
              >
                <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisHistory.map((analysisData, index) => (
                        <div key={analysisData.id} className="relative">
                          <div className="absolute -left-2 top-4 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {analysisHistory.length - index}
                            </span>
                          </div>
                          <div className="ml-6">
                            <div className="flex items-center gap-2 mb-2">
                              <ClockIcon className="w-3 h-3 text-text-secondary" />
                              <span className="text-xs text-text-secondary">
                                {new Date(
                                  analysisData.generated_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {index === 0 && (
                                <Chip size="sm" color="success" variant="flat">
                                  Latest
                                </Chip>
                              )}
                            </div>
                            {renderAnalysis(analysisData, true)}
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
