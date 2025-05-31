import { useState, useEffect, useCallback } from "react";
import { DealService } from "../services/dealService";
import type {
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealFilters,
  DealStage,
} from "../types";

export const useDeals = (filters?: DealFilters) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deals
  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealService.getDeals(filters);
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create a new deal
  const createDeal = useCallback(
    async (dealData: CreateDealInput): Promise<Deal> => {
      try {
        setError(null);
        const newDeal = await DealService.createDeal(dealData);
        setDeals((prev) => [newDeal, ...prev]);
        return newDeal;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create deal";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update an existing deal
  const updateDeal = useCallback(
    async (id: string, dealData: UpdateDealInput): Promise<Deal> => {
      try {
        setError(null);
        const updatedDeal = await DealService.updateDeal(id, dealData);
        setDeals((prev) =>
          prev.map((deal) => (deal.id === id ? updatedDeal : deal))
        );
        return updatedDeal;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update deal";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update deal stage (for drag and drop)
  const updateDealStage = useCallback(
    async (id: string, stage: DealStage): Promise<void> => {
      try {
        setError(null);
        const updatedDeal = await DealService.updateDealStage(id, stage);
        setDeals((prev) =>
          prev.map((deal) => (deal.id === id ? updatedDeal : deal))
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update deal stage";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Delete a deal
  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await DealService.deleteDeal(id);
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete deal";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Refresh deals
  const refresh = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    refresh,
  };
};

export const useDeal = (id: string | null) => {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!id) {
      setDeal(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DealService.getDeal(id);
      setDeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deal");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return {
    deal,
    loading,
    error,
    refresh: fetchDeal,
  };
};

export const useDealsPipeline = () => {
  const [pipeline, setPipeline] = useState<Record<DealStage, Deal[]>>({
    lead: [],
    prospect: [],
    negotiation: [],
    "closed-won": [],
    "closed-lost": [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealService.getDealsPipeline();
      setPipeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update deal stage in pipeline (optimistic update)
  const updateDealStage = useCallback(
    async (
      dealId: string,
      newStage: DealStage,
      oldStage: DealStage
    ): Promise<void> => {
      // Optimistic update
      setPipeline((prev) => {
        const newPipeline = { ...prev };
        const dealIndex = prev[oldStage].findIndex(
          (deal) => deal.id === dealId
        );

        if (dealIndex >= 0) {
          const deal = prev[oldStage][dealIndex];
          newPipeline[oldStage] = prev[oldStage].filter(
            (_, index) => index !== dealIndex
          );
          newPipeline[newStage] = [
            ...prev[newStage],
            { ...deal, stage: newStage },
          ];
        }

        return newPipeline;
      });

      try {
        await DealService.updateDealStage(dealId, newStage);
      } catch (err) {
        // Revert on error
        fetchPipeline();
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update deal stage";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchPipeline]
  );

  const refresh = useCallback(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  return {
    pipeline,
    loading,
    error,
    updateDealStage,
    refresh,
  };
};
