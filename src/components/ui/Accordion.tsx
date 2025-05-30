import React from "react";
import { Accordion as HeroUIAccordion, AccordionItem } from "@heroui/react";
import type { AccordionProps as HeroUIAccordionProps } from "@heroui/react";

export interface AccordionItemData {
  key: string;
  title: string;
  content: React.ReactNode;
  subtitle?: string;
  startContent?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends Omit<HeroUIAccordionProps, "children"> {
  items: AccordionItemData[];
  variant?: "light" | "shadow" | "bordered" | "splitted";
  selectionMode?: "none" | "single" | "multiple";
  isCompact?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  variant = "light",
  selectionMode = "single",
  isCompact = false,
  className,
  ...props
}) => {
  return (
    <HeroUIAccordion
      variant={variant}
      selectionMode={selectionMode}
      isCompact={isCompact}
      className={className}
      {...props}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.key}
          title={item.title}
          subtitle={item.subtitle}
          startContent={item.startContent}
          isDisabled={item.disabled}
        >
          {item.content}
        </AccordionItem>
      ))}
    </HeroUIAccordion>
  );
};
