import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Divider,
} from "@heroui/react";
import {
  SparklesIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ShoppingCartIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type {
  Contact,
  Deal,
  Communication,
  PurchaseHistory,
  ContactPersona,
} from "../types/index";
import { aiService } from "../services/aiService";

interface PersonaGeneratorProps {
  contact: Contact;
  deals: Deal[];
  communications: Communication[];
  purchaseHistory: PurchaseHistory[];
}

export const PersonaGenerator: React.FC<PersonaGeneratorProps> = ({
  contact,
  deals,
  communications,
  purchaseHistory,
}) => {
  const [persona, setPersona] = useState<ContactPersona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePersona = async () => {
    setLoading(true);
    setError(null);

    try {
      const generatedPersona = await aiService.generateContactPersona({
        contact_id: contact.id,
        contact_data: {
          contact,
          deals,
          communications,
          purchaseHistory,
        },
      });

      setPersona(generatedPersona);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate persona"
      );
    } finally {
      setLoading(false);
    }
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

  const getTraitColor = (index: number) => {
    const colors = ["primary", "secondary", "success", "warning", "danger"];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-surface border border-border">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            AI Behavioral Persona
          </h3>
        </div>
        {!persona && (
          <Button
            color="primary"
            variant="flat"
            startContent={<SparklesIcon className="w-4 h-4" />}
            onPress={handleGeneratePersona}
            isLoading={loading}
            isDisabled={loading}
          >
            {loading ? "Generating..." : "Generate Persona"}
          </Button>
        )}
      </CardHeader>

      <CardBody className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
            <p className="text-danger-600 text-sm">{error}</p>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              className="mt-2"
              onPress={handleGeneratePersona}
              isLoading={loading}
            >
              Try Again
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Spinner size="lg" color="primary" />
            <p className="text-text-secondary text-sm">
              Analyzing {contact.name}'s behavioral patterns...
            </p>
            <p className="text-text-secondary text-xs">
              Processing {deals.length} deals, {communications.length}{" "}
              communications, and {purchaseHistory.length} purchases
            </p>
          </div>
        )}

        {persona && (
          <div className="space-y-6">
            {/* Persona Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-text-secondary" />
                <h4 className="font-semibold text-text-primary">
                  Profile Summary
                </h4>
              </div>
              <p className="text-text-secondary leading-relaxed bg-background p-3 rounded-lg">
                {persona.persona_summary}
              </p>
            </div>

            <Divider />

            {/* Behavioral Traits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-text-secondary" />
                <h4 className="font-semibold text-text-primary">
                  Behavioral Traits
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {persona.behavioral_traits.map((trait, index) => (
                  <Chip
                    key={index}
                    size="sm"
                    color={getTraitColor(index) as any}
                    variant="flat"
                  >
                    {trait}
                  </Chip>
                ))}
              </div>
            </div>

            <Divider />

            {/* Communication Preferences */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-text-secondary" />
                <h4 className="font-semibold text-text-primary">
                  Communication Preferences
                </h4>
              </div>
              <div className="space-y-2">
                {persona.communication_preferences.map((preference, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg bg-background"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-text-secondary text-sm">{preference}</p>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Buying Patterns */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-4 h-4 text-text-secondary" />
                <h4 className="font-semibold text-text-primary">
                  Buying Patterns
                </h4>
              </div>
              <div className="space-y-2">
                {persona.buying_patterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg bg-background"
                  >
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                    <p className="text-text-secondary text-sm">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Generation Info */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                <span>Generated: {formatDate(persona.generated_at)}</span>
              </div>
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<SparklesIcon className="w-3 h-3" />}
                onPress={handleGeneratePersona}
                isLoading={loading}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {!persona && !loading && !error && (
          <div className="text-center py-8 space-y-3">
            <SparklesIcon className="w-12 h-12 text-text-secondary mx-auto opacity-50" />
            <p className="text-text-secondary">
              Generate an AI-powered behavioral persona for {contact.name}
            </p>
            <p className="text-text-secondary text-sm">
              Analyze communication patterns, deal history, and purchase
              behavior to create actionable insights
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
