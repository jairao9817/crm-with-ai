import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useDeals } from "../hooks/useDeals";
import { useContacts } from "../hooks/useContacts";
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealStage,
} from "../types";

const dealSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  contact_id: z.string().optional(),
  stage: z
    .enum(["lead", "prospect", "negotiation", "closed-won", "closed-lost"])
    .default("lead"),
  monetary_value: z.number().min(0, "Value must be positive").default(0),
  expected_close_date: z.string().optional(),
  probability_percentage: z
    .number()
    .min(0, "Probability must be at least 0")
    .max(100, "Probability must be at most 100")
    .default(0),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  deal?: Deal;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultContactId?: string;
}

const stageOptions: { key: DealStage; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "default" },
  { key: "prospect", label: "Prospect", color: "primary" },
  { key: "negotiation", label: "Negotiation", color: "warning" },
  { key: "closed-won", label: "Closed Won", color: "success" },
  { key: "closed-lost", label: "Closed Lost", color: "danger" },
];

export const DealForm: React.FC<DealFormProps> = ({
  deal,
  onSuccess,
  onCancel,
  defaultContactId,
}) => {
  const { createDeal, updateDeal } = useDeals();
  const { contacts } = useContacts();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      contact_id: defaultContactId || "",
      stage: "lead",
      monetary_value: 0,
      expected_close_date: "",
      probability_percentage: 0,
    },
  });

  // Watch stage to auto-update probability
  const selectedStage = watch("stage");

  // Auto-update probability based on stage
  useEffect(() => {
    const stageProbabilities: Record<DealStage, number> = {
      lead: 10,
      prospect: 25,
      negotiation: 60,
      "closed-won": 100,
      "closed-lost": 0,
    };

    if (selectedStage && !deal) {
      // Only auto-set for new deals
      setValue("probability_percentage", stageProbabilities[selectedStage]);
    }
  }, [selectedStage, setValue, deal]);

  // Reset form when deal prop changes
  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        contact_id: deal.contact_id || "",
        stage: deal.stage,
        monetary_value: deal.monetary_value,
        expected_close_date: deal.expected_close_date || "",
        probability_percentage: deal.probability_percentage,
      });
    } else {
      reset({
        title: "",
        contact_id: defaultContactId || "",
        stage: "lead",
        monetary_value: 0,
        expected_close_date: "",
        probability_percentage: 10,
      });
    }
  }, [deal, defaultContactId, reset]);

  const onSubmit = async (data: DealFormData) => {
    try {
      clearErrors();

      if (deal) {
        // Update existing deal
        const updateData: UpdateDealInput = {
          title: data.title,
          contact_id: data.contact_id || undefined,
          stage: data.stage,
          monetary_value: data.monetary_value,
          expected_close_date: data.expected_close_date || undefined,
          probability_percentage: data.probability_percentage,
        };
        await updateDeal(deal.id, updateData);
      } else {
        // Create new deal
        const createData: CreateDealInput = {
          title: data.title,
          contact_id: data.contact_id || undefined,
          stage: data.stage,
          monetary_value: data.monetary_value,
          expected_close_date: data.expected_close_date || undefined,
          probability_percentage: data.probability_percentage,
        };
        await createDeal(createData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Failed to save deal:", error);
      setError("root", {
        message: error instanceof Error ? error.message : "Failed to save deal",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title Field */}
      <Input
        label="Deal Title"
        placeholder="Enter deal title"
        isRequired
        isInvalid={!!errors.title}
        errorMessage={errors.title?.message}
        {...register("title")}
      />

      {/* Contact Selection */}
      <Select
        label="Associated Contact"
        placeholder="Select a contact (optional)"
        selectedKeys={watch("contact_id") ? [watch("contact_id")] : []}
        onSelectionChange={(keys) => {
          const contactId = Array.from(keys)[0] as string;
          setValue("contact_id", contactId || "");
        }}
        isInvalid={!!errors.contact_id}
        errorMessage={errors.contact_id?.message}
      >
        {[
          <SelectItem key="">No contact selected</SelectItem>,
          ...contacts.map((contact) => (
            <SelectItem
              key={contact.id}
              textValue={`${contact.name} (${contact.email})`}
            >
              {contact.name} ({contact.email})
            </SelectItem>
          )),
        ]}
      </Select>

      {/* Stage Selection */}
      <Select
        label="Deal Stage"
        placeholder="Select deal stage"
        selectedKeys={[watch("stage")]}
        onSelectionChange={(keys) => {
          const stage = Array.from(keys)[0] as DealStage;
          setValue("stage", stage);
        }}
        isInvalid={!!errors.stage}
        errorMessage={errors.stage?.message}
      >
        {stageOptions.map((option) => (
          <SelectItem key={option.key}>{option.label}</SelectItem>
        ))}
      </Select>

      {/* Monetary Value */}
      <Input
        label="Deal Value"
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">$</span>
          </div>
        }
        isInvalid={!!errors.monetary_value}
        errorMessage={errors.monetary_value?.message}
        {...register("monetary_value", { valueAsNumber: true })}
      />

      {/* Expected Close Date */}
      <Input
        label="Expected Close Date"
        placeholder="Select expected close date"
        type="date"
        isInvalid={!!errors.expected_close_date}
        errorMessage={errors.expected_close_date?.message}
        {...register("expected_close_date")}
      />

      {/* Probability Percentage */}
      <Input
        label="Probability (%)"
        placeholder="0"
        type="number"
        min="0"
        max="100"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">%</span>
          </div>
        }
        isInvalid={!!errors.probability_percentage}
        errorMessage={errors.probability_percentage?.message}
        {...register("probability_percentage", { valueAsNumber: true })}
      />

      {/* Error Message */}
      {errors.root && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm">{errors.root.message}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button variant="light" onPress={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" color="primary" isLoading={isSubmitting}>
          {deal ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </form>
  );
};
