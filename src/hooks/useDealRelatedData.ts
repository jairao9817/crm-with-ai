import { useState, useEffect, useCallback } from "react";
import { TaskService } from "../services/taskService";
import { CommunicationService } from "../services/communicationService";
import { PurchaseHistoryService } from "../services/purchaseHistoryService";
import type { Task, Communication, PurchaseHistory } from "../types";

export const useDealRelatedData = (dealId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatedData = useCallback(async () => {
    if (!dealId) {
      setTasks([]);
      setCommunications([]);
      setPurchaseHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all related data in parallel
      const [tasksData, communicationsData, purchaseHistoryData] =
        await Promise.all([
          TaskService.getTasks({ deal_id: dealId }),
          CommunicationService.getCommunications({ deal_id: dealId }),
          PurchaseHistoryService.getPurchaseHistory({ deal_id: dealId }),
        ]);

      setTasks(tasksData);
      setCommunications(communicationsData);
      setPurchaseHistory(purchaseHistoryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch related data"
      );
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchRelatedData();
  }, [fetchRelatedData]);

  return {
    tasks,
    communications,
    purchaseHistory,
    loading,
    error,
    refresh: fetchRelatedData,
  };
};
