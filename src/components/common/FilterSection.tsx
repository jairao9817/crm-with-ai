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
    <Card className="shadow-lg border border-border bg-surface">
      <CardBody className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={searchPlaceholder}
              startContent={
                <MagnifyingGlassIcon className="w-5 h-5 text-text-tertiary" />
              }
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
              classNames={{
                input:
                  "bg-transparent text-text-primary placeholder:text-text-tertiary text-base",
                inputWrapper:
                  "bg-background-secondary border-border hover:border-border-focus focus-within:border-primary-500 shadow-sm h-12",
                label: "text-text-primary",
              }}
              size="lg"
            />
          </div>
          {filtersContent && (
            <Button
              variant={showFilters ? "solid" : "bordered"}
              color={showFilters ? "primary" : "default"}
              startContent={<FunnelIcon className="w-5 h-5" />}
              onPress={onToggleFilters}
              className={`
                h-12 px-6 font-medium transition-all duration-200
                ${
                  showFilters
                    ? "shadow-lg hover:shadow-xl"
                    : "hover:bg-background-secondary border-border hover:border-border-focus"
                }
              `}
            >
              Filters
              {showFilters && (
                <div className="ml-2 w-2 h-2 rounded-full bg-white/80" />
              )}
            </Button>
          )}
        </div>

        {showFilters && filtersContent && (
          <div className="mt-8 pt-6 border-t border-border/60">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Filter Options
              </h4>
              <div className="bg-background-secondary/50 rounded-xl p-4 border border-border/50">
                {filtersContent}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FilterSection;
