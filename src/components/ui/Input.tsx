import React from "react";
import { Input as HeroUIInput } from "@heroui/react";
import type { InputProps as HeroUIInputProps } from "@heroui/react";

export interface InputProps
  extends Omit<HeroUIInputProps, "size" | "color" | "variant"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showLabel?: boolean;
  variant?: "default" | "error" | "success";
  size?: "sm" | "md" | "lg";
}

const mapVariantToHeroUI = (
  variant?: InputProps["variant"],
  error?: string
) => {
  if (error) {
    return { color: "danger" as const, variant: "bordered" as const };
  }

  switch (variant) {
    case "error":
      return { color: "danger" as const, variant: "bordered" as const };
    case "success":
      return { color: "success" as const, variant: "bordered" as const };
    case "default":
    default:
      return { color: "default" as const, variant: "bordered" as const };
  }
};

const mapSizeToHeroUI = (size?: InputProps["size"]) => {
  switch (size) {
    case "sm":
      return "sm" as const;
    case "md":
      return "md" as const;
    case "lg":
      return "lg" as const;
    default:
      return "md" as const;
  }
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showLabel = true,
      className,
      ...props
    },
    ref
  ) => {
    const { color, variant: heroUIVariant } = mapVariantToHeroUI(
      variant,
      error
    );
    const heroUISize = mapSizeToHeroUI(size);

    return (
      <HeroUIInput
        ref={ref}
        color={color}
        variant={heroUIVariant}
        size={heroUISize}
        label={showLabel ? label : undefined}
        placeholder={!showLabel ? label : props.placeholder}
        description={hint && !error ? hint : undefined}
        errorMessage={error}
        isInvalid={!!error}
        isRequired={props.required}
        startContent={leftIcon}
        endContent={rightIcon}
        className={className}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
