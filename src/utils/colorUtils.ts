/**
 * Color utility functions for consistent color usage across the application
 */

export type StatusType = "success" | "warning" | "error" | "info" | "default";
export type TaskStatus = "completed" | "pending" | "overdue";
export type DealStage =
  | "lead"
  | "prospect"
  | "negotiation"
  | "closed-won"
  | "closed-lost";
export type PurchaseStatus = "completed" | "pending" | "refunded" | "cancelled";

/**
 * Get semantic color for task status
 */
export const getTaskStatusColor = (status: TaskStatus): StatusType => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "default";
  }
};

/**
 * Get semantic color for deal stage
 */
export const getDealStageColor = (stage: DealStage): StatusType => {
  switch (stage) {
    case "lead":
      return "default";
    case "prospect":
      return "info";
    case "negotiation":
      return "warning";
    case "closed-won":
      return "success";
    case "closed-lost":
      return "error";
    default:
      return "default";
  }
};

/**
 * Get semantic color for purchase status
 */
export const getPurchaseStatusColor = (status: PurchaseStatus): StatusType => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "refunded":
      return "error";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
};

/**
 * Get text color class for status
 */
export const getStatusTextColor = (status: StatusType): string => {
  switch (status) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "error":
      return "text-error";
    case "info":
      return "text-primary";
    default:
      return "text-text-secondary";
  }
};

/**
 * Get background color class for status
 */
export const getStatusBgColor = (status: StatusType): string => {
  switch (status) {
    case "success":
      return "bg-success-100";
    case "warning":
      return "bg-warning-100";
    case "error":
      return "bg-error-100";
    case "info":
      return "bg-primary-100";
    default:
      return "bg-neutral-100";
  }
};

/**
 * Get icon color class for status
 */
export const getStatusIconColor = (status: StatusType): string => {
  switch (status) {
    case "success":
      return "text-success-600";
    case "warning":
      return "text-warning-600";
    case "error":
      return "text-error-600";
    case "info":
      return "text-primary-600";
    default:
      return "text-text-secondary";
  }
};

/**
 * Common text color classes
 */
export const textColors = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  tertiary: "text-text-tertiary",
  inverse: "text-text-inverse",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  info: "text-primary",
} as const;

/**
 * Common background color classes
 */
export const bgColors = {
  primary: "bg-background",
  secondary: "bg-background-secondary",
  tertiary: "bg-background-tertiary",
  surface: "bg-surface",
  surfaceSecondary: "bg-surface-secondary",
} as const;

/**
 * Common border color classes
 */
export const borderColors = {
  default: "border-border",
  secondary: "border-border-secondary",
  focus: "border-border-focus",
} as const;
