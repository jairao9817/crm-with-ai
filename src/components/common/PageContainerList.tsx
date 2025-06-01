import React from "react";
import PageHeader from "./PageHeader";
import StatsGrid from "./StatsGrid";
import type { StatItem } from "./StatsGrid";
import FilterSection from "./FilterSection";
import DataList from "./DataList";

interface PageContainerListProps<T> {
  // Header props
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => void;

  // Stats props
  stats?: StatItem[];
  statsColumns?: number;

  // Filter props
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  filtersContent?: React.ReactNode;

  // Data list props
  items: T[];
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  itemKey?: keyof T | ((item: T) => string);

  // Additional content
  children?: React.ReactNode;
}

const PageContainerList = <T extends Record<string, any>>({
  // Header props
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,

  // Stats props
  stats,
  statsColumns = 4,

  // Filter props
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showFilters,
  onToggleFilters,
  filtersContent,

  // Data list props
  items,
  loading,
  renderItem,
  onItemClick,
  emptyState,
  itemKey = "id",

  // Additional content
  children,
}: PageContainerListProps<T>) => {
  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-background to-background-secondary rounded-2xl p-8 border border-border shadow-sm">
        <PageHeader
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          actionIcon={actionIcon}
          onAction={onAction}
        />
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary px-1">
            Overview
          </h3>
          <StatsGrid stats={stats} columns={statsColumns} />
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary px-1">
          {loading ? "Loading..." : `${items.length} ${title.toLowerCase()}`}
        </h3>
        <FilterSection
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          showFilters={showFilters}
          onToggleFilters={onToggleFilters}
          filtersContent={filtersContent}
        />
      </div>

      {/* Data List */}
      <div className="space-y-2">
        <DataList
          items={items}
          loading={loading}
          renderItem={renderItem}
          onItemClick={onItemClick}
          emptyState={emptyState}
          itemKey={itemKey}
        />
      </div>

      {/* Additional content (like modals) */}
      {children}
    </div>
  );
};

export default PageContainerList;
