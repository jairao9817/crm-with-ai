import { useState, useEffect } from "react";

interface UsePageDataOptions<T, F> {
  loadData: (filters?: F) => Promise<T[]>;
  loadAdditionalData?: () => Promise<void>;
  dependencies?: any[];
}

interface UsePageDataResult<T, F> {
  items: T[];
  loading: boolean;
  filters: F;
  setFilters: (filters: F | ((prev: F) => F)) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  refreshData: () => Promise<void>;
}

export const usePageData = <T, F extends Record<string, any>>({
  loadData,
  loadAdditionalData,
  dependencies = [],
}: UsePageDataOptions<T, F>): UsePageDataResult<T, F> => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<F>({} as F);
  const [showFilters, setShowFilters] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await loadData(filters);
      setItems(data);

      if (loadAdditionalData) {
        await loadAdditionalData();
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [filters, ...dependencies]);

  return {
    items,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    refreshData,
  };
};
