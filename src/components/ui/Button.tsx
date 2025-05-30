import React from "react";
import { Button as HeroUIButton } from "@heroui/react";
import type { ButtonProps as HeroUIButtonProps } from "@heroui/react";

export interface ButtonProps
  extends Omit<HeroUIButtonProps, "size" | "color" | "variant"> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "outline"
    | "ghost"
    | "link";
  size?: "sm" | "md" | "lg" | "xl";
}

const mapVariantToHeroUI = (variant?: ButtonProps["variant"]) => {
  switch (variant) {
    case "primary":
      return { color: "primary" as const, variant: "solid" as const };
    case "secondary":
      return { color: "secondary" as const, variant: "solid" as const };
    case "success":
      return { color: "success" as const, variant: "solid" as const };
    case "warning":
      return { color: "warning" as const, variant: "solid" as const };
    case "error":
      return { color: "danger" as const, variant: "solid" as const };
    case "outline":
      return { color: "primary" as const, variant: "bordered" as const };
    case "ghost":
      return { color: "primary" as const, variant: "light" as const };
    case "link":
      return { color: "primary" as const, variant: "light" as const };
    default:
      return { color: "primary" as const, variant: "solid" as const };
  }
};

const mapSizeToHeroUI = (size?: ButtonProps["size"]) => {
  switch (size) {
    case "sm":
      return "sm" as const;
    case "md":
      return "md" as const;
    case "lg":
      return "lg" as const;
    case "xl":
      return "lg" as const; // HeroUI doesn't have xl, map to lg
    default:
      return "md" as const;
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const { color, variant: heroUIVariant } = mapVariantToHeroUI(variant);
    const heroUISize = mapSizeToHeroUI(size);

    return (
      <HeroUIButton
        ref={ref}
        color={color}
        variant={heroUIVariant}
        size={heroUISize}
        isLoading={loading}
        isDisabled={disabled || loading}
        className={className}
        startContent={!loading && leftIcon ? leftIcon : undefined}
        endContent={!loading && rightIcon ? rightIcon : undefined}
        {...props}
      >
        {children}
      </HeroUIButton>
    );
  }
);

Button.displayName = "Button";
