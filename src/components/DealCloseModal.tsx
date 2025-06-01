import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import { DealService } from "../services/dealService";
import type { Deal, PurchaseStatus } from "../types";

interface DealCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  onSuccess: () => void;
}

interface PurchaseFormData {
  amount: number;
  product_service: string;
  date: string;
  status: PurchaseStatus;
}

export const DealCloseModal: React.FC<DealCloseModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormData>({
    defaultValues: {
      amount: deal.monetary_value,
      product_service: deal.title,
      date: new Date().toISOString().split("T")[0],
      status: "completed",
    },
  });

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      if (!deal.contact_id) {
        throw new Error("Deal must have a contact to create purchase history");
      }

      // First, close the deal as won (without auto-creating purchase history)
      await DealService.closeDealAsWon(deal.id, false);

      // Then create the custom purchase history record
      await PurchaseHistoryService.createPurchaseHistory({
        contact_id: deal.contact_id,
        deal_id: deal.id,
        date: data.date,
        amount: data.amount,
        product_service: data.product_service,
        status: data.status,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to close deal and create purchase record:", error);
    }
  };

  const handleSkipPurchase = async () => {
    try {
      // Close deal as won without creating purchase history
      await DealService.closeDealAsWon(deal.id, false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to close deal:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-surface border border-border",
        header: "border-b border-border",
        body: "py-6",
        footer: "border-t border-border",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-text-primary">
            Close Deal as Won
          </h2>
          <p className="text-sm text-text-secondary">
            Deal "{deal.title}" will be closed as won. Create a purchase history
            record:
          </p>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="space-y-4">
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  label="Purchase Amount"
                  startContent="$"
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount?.message}
                  value={field.value?.toString() || ""}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                  description={`Deal value: ${formatCurrency(
                    deal.monetary_value
                  )}`}
                  classNames={{
                    input:
                      "bg-transparent text-text-primary placeholder:text-text-tertiary",
                    inputWrapper:
                      "bg-background-secondary border-border hover:border-border-focus",
                    label: "text-text-primary",
                    description: "text-text-secondary",
                  }}
                />
              )}
            />

            <Controller
              name="product_service"
              control={control}
              rules={{ required: "Product/Service is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Product/Service"
                  placeholder="Enter product or service name"
                  isInvalid={!!errors.product_service}
                  errorMessage={errors.product_service?.message}
                  classNames={{
                    input:
                      "bg-transparent text-text-primary placeholder:text-text-tertiary",
                    inputWrapper:
                      "bg-background-secondary border-border hover:border-border-focus",
                    label: "text-text-primary",
                  }}
                />
              )}
            />

            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Purchase Date"
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message}
                  classNames={{
                    input:
                      "bg-transparent text-text-primary placeholder:text-text-tertiary",
                    inputWrapper:
                      "bg-background-secondary border-border hover:border-border-focus",
                    label: "text-text-primary",
                  }}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Status"
                  placeholder="Select purchase status"
                  selectedKeys={field.value ? [field.value] : ["completed"]}
                  onSelectionChange={(keys) =>
                    field.onChange(Array.from(keys)[0] as PurchaseStatus)
                  }
                  classNames={{
                    trigger:
                      "bg-background-secondary border-border hover:border-border-focus",
                    value: "text-text-primary",
                    label: "text-text-primary",
                    popoverContent: "bg-surface border border-border",
                  }}
                >
                  <SelectItem key="completed" className="text-text-primary">
                    Completed
                  </SelectItem>
                  <SelectItem key="pending" className="text-text-primary">
                    Pending
                  </SelectItem>
                  <SelectItem key="refunded" className="text-text-primary">
                    Refunded
                  </SelectItem>
                  <SelectItem key="cancelled" className="text-text-primary">
                    Cancelled
                  </SelectItem>
                </Select>
              )}
            />

            {deal.contact && (
              <div className="p-3 bg-background-secondary border border-border rounded-lg">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Customer:</strong>{" "}
                  {deal.contact.name} ({deal.contact.email})
                </p>
                {deal.contact.company && (
                  <p className="text-sm text-text-secondary">
                    <strong className="text-text-primary">Company:</strong>{" "}
                    {deal.contact.company}
                  </p>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter className="flex justify-between">
            <Button
              variant="light"
              onPress={onClose}
              className="text-text-secondary hover:text-text-primary hover:bg-background-secondary"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="flat"
                onPress={handleSkipPurchase}
                isDisabled={isSubmitting}
                className="bg-background-secondary text-text-primary hover:bg-background-tertiary border border-border"
              >
                Close Deal Only
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                Close Deal & Create Purchase
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
