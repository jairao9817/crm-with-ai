import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  size = "2xl",
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <ModalContent>
        <form onSubmit={onSubmit}>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody className="space-y-4">{children}</ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {cancelLabel}
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              {submitLabel}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
