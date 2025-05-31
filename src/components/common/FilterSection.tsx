import React from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface FilterSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  filtersContent?: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  showFilters,
  onToggleFilters,
  filtersContent,
}) => {
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder={searchPlaceholder}
            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
          />
          {filtersContent && (
            <Button
              variant={showFilters ? "solid" : "bordered"}
              startContent={<FunnelIcon className="w-4 h-4" />}
              onPress={onToggleFilters}
            >
              Filters
            </Button>
          )}
        </div>

        {showFilters && filtersContent && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {filtersContent}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FilterSection;
