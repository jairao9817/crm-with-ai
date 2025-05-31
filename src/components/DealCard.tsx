import React from "react";
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import type { Deal } from "../types";

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BriefcaseIcon className="w-5 h-5" />
          Associated Deal
        </h3>
      </CardHeader>
      <CardBody>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {deal.title}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <Chip color="primary" variant="flat" size="sm">
              {deal.stage}
            </Chip>
            <span className="text-lg font-semibold text-success">
              {formatCurrency(deal.monetary_value)}
            </span>
          </div>
          {deal.contact && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Contact
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {deal.contact.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {deal.contact.email}
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DealCard;
