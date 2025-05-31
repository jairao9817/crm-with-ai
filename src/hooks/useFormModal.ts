import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { useDisclosure } from "@heroui/react";

interface UseFormModalOptions<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  defaultValues?: Partial<T>;
}

interface UseFormModalResult<T extends FieldValues> {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: ReturnType<typeof useForm<T>>;
  handleSubmit: (data: T) => Promise<void>;
  isSubmitting: boolean;
}

export const useFormModal = <T extends FieldValues>({
  onSubmit,
  onSuccess,
  defaultValues,
}: UseFormModalOptions<T>): UseFormModalResult<T> => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    defaultValues: defaultValues as any,
  });

  const handleSubmit = async (data: T) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return {
    isOpen,
    onOpen,
    onClose: handleClose,
    form,
    handleSubmit,
    isSubmitting,
  };
};
