import React from "react";
import {
  Dropdown,
  DropdownTrigger as HeroUIDropdownTrigger,
  DropdownMenu as HeroUIDropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export interface DropdownMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  className?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  className = "",
  menuClassName = "",
  align = "left",
}) => {
  // Filter out divider items for the actual dropdown items
  const dropdownItems = items.filter((item) => !item.divider);

  return (
    <div className={`inline-block ${className}`}>
      <Dropdown placement={align === "right" ? "bottom-end" : "bottom-start"}>
        <HeroUIDropdownTrigger>{trigger}</HeroUIDropdownTrigger>
        <HeroUIDropdownMenu
          aria-label="Actions"
          className={menuClassName}
          variant="flat"
        >
          {dropdownItems.map((item, index) => (
            <DropdownItem
              key={index}
              startContent={item.icon}
              color={item.destructive ? "danger" : "default"}
              className={clsx({
                "text-danger": item.destructive,
              })}
              isDisabled={item.disabled}
              href={item.href}
              onPress={item.onClick}
            >
              {item.label}
            </DropdownItem>
          ))}
        </HeroUIDropdownMenu>
      </Dropdown>
    </div>
  );
};

// Simplified trigger button component
interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  showChevron?: boolean;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  className = "",
  showChevron = true,
}) => {
  return (
    <Button
      variant="bordered"
      className={className}
      endContent={
        showChevron ? <ChevronDownIcon className="h-4 w-4" /> : undefined
      }
    >
      {children}
    </Button>
  );
};
