import React from "react";
import {
  Modal as HeroUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
}

const mapSizeToHeroUI = (size?: ModalProps["size"]) => {
  switch (size) {
    case "sm":
      return "sm" as const;
    case "md":
      return "md" as const;
    case "lg":
      return "lg" as const;
    case "xl":
      return "2xl" as const;
    case "full":
      return "full" as const;
    default:
      return "md" as const;
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
}) => {
  const heroUISize = mapSizeToHeroUI(size);

  return (
    <HeroUIModal
      isOpen={isOpen}
      onClose={onClose}
      size={heroUISize}
      className={className}
      closeButton={showCloseButton ? undefined : <></>}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">
                {title}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="absolute right-3 top-3 p-2"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                )}
              </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
          </>
        )}
      </ModalContent>
    </HeroUIModal>
  );
};
