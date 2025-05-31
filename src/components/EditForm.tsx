import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";

interface FormField {
  name: string;
  label: string;
  type: "input" | "select" | "textarea" | "date" | "datetime-local";
  required?: boolean;
  placeholder?: string;
  options?: { key: string; label: string }[];
  validation?: any;
  startContent?: React.ReactNode;
  minRows?: number;
}

interface EditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  fields: FormField[];
  defaultValues?: any;
  submitting?: boolean;
}

const EditForm: React.FC<EditFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  defaultValues,
  submitting = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
  };

  const renderField = (field: FormField) => {
    const fieldProps = {
      label: field.label,
      placeholder: field.placeholder,
      isInvalid: !!errors[field.name],
      errorMessage: errors[field.name]?.message,
      startContent: field.startContent,
    };

    switch (field.type) {
      case "select":
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: controllerField }) => {
              const { Select, SelectItem } = require("@heroui/react");
              return (
                <Select
                  {...controllerField}
                  {...fieldProps}
                  selectedKeys={
                    controllerField.value ? [controllerField.value] : []
                  }
                  onSelectionChange={(keys) =>
                    controllerField.onChange(Array.from(keys)[0])
                  }
                >
                  {field.options?.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              );
            }}
          />
        );

      case "textarea":
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: controllerField }) => {
              const { Textarea } = require("@heroui/react");
              return (
                <Textarea
                  {...controllerField}
                  {...fieldProps}
                  minRows={field.minRows || 4}
                />
              );
            }}
          />
        );

      default:
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: controllerField }) => {
              const { Input } = require("@heroui/react");
              return (
                <Input
                  {...controllerField}
                  {...fieldProps}
                  type={field.type === "input" ? "text" : field.type}
                />
              );
            }}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea"
                    ? ""
                    : index % 2 === 0 &&
                      index < fields.length - 1 &&
                      fields[index + 1].type !== "textarea"
                    ? "grid grid-cols-2 gap-4"
                    : ""
                }
              >
                {renderField(field)}
                {index % 2 === 0 &&
                  index < fields.length - 1 &&
                  fields[index + 1].type !== "textarea" &&
                  renderField(fields[index + 1])}
              </div>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={submitting}>
              Update
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditForm;
