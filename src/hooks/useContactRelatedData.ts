import { useState, useEffect, useCallback } from "react";
import { DealService } from "../services/dealService";
import { CommunicationService } from "../services/communicationService";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import type { Deal, Communication, PurchaseHistory } from "../types";

export const useContactRelatedData = (contactId: string | null) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedData = useCallback(async () => {
    if (!contactId) {
      setDeals([]);
      setCommunications([]);
      setPurchaseHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all related data in parallel
      const [dealsData, communicationsData, purchaseHistoryData] =
        await Promise.all([
          DealService.getDeals({ contact_id: contactId }),
          CommunicationService.getCommunications({ contact_id: contactId }),
          PurchaseHistoryService.getPurchaseHistory({ contact_id: contactId }),
        ]);

      setDeals(dealsData);
      setCommunications(communicationsData);
      setPurchaseHistory(purchaseHistoryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch related data"
      );
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchRelatedData();
  }, [fetchRelatedData]);

  return {
    deals,
    communications,
    purchaseHistory,
    loading,
    error,
    refresh: fetchRelatedData,
  };
};
