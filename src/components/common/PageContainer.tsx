import React from "react";
import PageHeader from "./PageHeader";
import StatsGrid from "./StatsGrid";
import type { StatItem } from "./StatsGrid";
import FilterSection from "./FilterSection";
import DataGrid from "./DataGrid";

interface PageContainerProps<T> {
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

  // Data grid props
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
  gridColumns?: number;
  itemKey?: keyof T | ((item: T) => string);

  // Additional content
  children?: React.ReactNode;
}

const PageContainer = <T extends Record<string, any>>({
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

  // Data grid props
  items,
  loading,
  renderItem,
  onItemClick,
  emptyState,
  gridColumns = 3,
  itemKey = "id",

  // Additional content
  children,
}: PageContainerProps<T>) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        actionIcon={actionIcon}
        onAction={onAction}
      />

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <StatsGrid stats={stats} columns={statsColumns} />
      )}

      {/* Filters */}
      <FilterSection
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        filtersContent={filtersContent}
      />

      {/* Data Grid */}
      <DataGrid
        items={items}
        loading={loading}
        renderItem={renderItem}
        onItemClick={onItemClick}
        emptyState={emptyState}
        columns={gridColumns}
        itemKey={itemKey}
      />

      {/* Additional content (like modals) */}
      {children}
    </div>
  );
};

export default PageContainer;
