import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";

interface SidebarAction {
  label: string;
  color: "primary" | "danger" | "secondary" | "success" | "warning" | "default";
  variant?: "solid" | "flat" | "bordered" | "light" | "ghost" | "shadow";
  icon: React.ReactNode;
  onClick: () => void;
}

interface SidebarActionsProps {
  actions: SidebarAction[];
  children?: React.ReactNode;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
  actions,
  children,
}) => {
  return (
    <div className="xl:col-span-1 space-y-6">
      {children}
      <Card className="shadow-md">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                color={action.color}
                variant={action.variant || "flat"}
                fullWidth
                onPress={action.onClick}
                startContent={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SidebarActions;
