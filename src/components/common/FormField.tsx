import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Input, Select, SelectItem, Textarea } from "@heroui/react";

type FormFieldType =
  | "input"
  | "select"
  | "textarea"
  | "number"
  | "date"
  | "datetime-local";

interface BaseFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  rules?: any;
  type?: FormFieldType;
  startContent?: React.ReactNode;
  minRows?: number;
  step?: string;
  defaultValue?: string;
}

interface SelectOption {
  key: string;
  label: string;
}

interface FormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  options?: SelectOption[];
  onSelectionChange?: (value: string) => void;
}

const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  rules = {},
  type = "input",
  options = [],
  startContent,
  minRows = 3,
  step,
  defaultValue,
  onSelectionChange,
}: FormFieldProps<T>) => {
  const fieldRules = required
    ? { required: `${label} is required`, ...rules }
    : rules;

  return (
    <Controller
      name={name}
      control={control}
      rules={fieldRules}
      render={({ field, fieldState: { error } }) => {
        const commonProps = {
          ...field,
          label,
          placeholder,
          isInvalid: !!error,
          errorMessage: error?.message,
        };

        switch (type) {
          case "select":
            return (
              <Select
                {...commonProps}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  field.onChange(value);
                  onSelectionChange?.(value);
                }}
              >
                {options.map((option) => (
                  <SelectItem key={option.key}>{option.label}</SelectItem>
                ))}
              </Select>
            );

          case "textarea":
            return <Textarea {...commonProps} minRows={minRows} />;

          case "number":
            return (
              <Input
                {...commonProps}
                type="number"
                step={step}
                startContent={startContent}
                value={field.value?.toString() || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(isNaN(value) ? 0 : value);
                }}
              />
            );

          case "date":
          case "datetime-local":
            return (
              <Input {...commonProps} type={type} defaultValue={defaultValue} />
            );

          default:
            return <Input {...commonProps} startContent={startContent} />;
        }
      }}
    />
  );
};

export default FormField;
