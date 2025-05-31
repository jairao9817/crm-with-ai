import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@heroui/react";

interface UseDetailPageOptions<T> {
  id: string | undefined;
  loadItem: (id: string) => Promise<T | null>;
  updateItem: (id: string, data: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  redirectPath: string;
  itemName: string;
}

export function useDetailPage<T>({
  id,
  loadItem,
  updateItem,
  deleteItem,
  redirectPath,
  itemName,
}: UseDetailPageOptions<T>) {
  const navigate = useNavigate();
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  useEffect(() => {
    if (id) {
      loadItemData();
    }
  }, [id]);

  const loadItemData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await loadItem(id);
      if (data) {
        setItem(data);
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error(`Failed to load ${itemName}:`, error);
      navigate(redirectPath);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!item || !id) return;

    try {
      setSubmitting(true);
      await updateItem(id, data);
      await loadItemData();
      onEditClose();
    } catch (error) {
      console.error(`Failed to update ${itemName}:`, error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !id) return;

    if (window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
      try {
        await deleteItem(id);
        navigate(redirectPath);
      } catch (error) {
        console.error(`Failed to delete ${itemName}:`, error);
      }
    }
  };

  return {
    item,
    loading,
    submitting,
    isEditOpen,
    onEditOpen,
    onEditClose,
    handleUpdate,
    handleDelete,
    navigate,
    redirectPath,
  };
}
