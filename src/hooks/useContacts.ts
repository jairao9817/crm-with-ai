import { useState, useEffect, useCallback } from "react";
import { ContactService } from "../services/contactService";
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
} from "../types";

export const useContacts = (filters?: ContactFilters) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContactService.getContacts(filters);
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create a new contact
  const createContact = useCallback(
    async (contactData: CreateContactInput): Promise<Contact> => {
      try {
        setError(null);
        const newContact = await ContactService.createContact(contactData);
        setContacts((prev) => [newContact, ...prev]);
        return newContact;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create contact";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update an existing contact
  const updateContact = useCallback(
    async (id: string, contactData: UpdateContactInput): Promise<Contact> => {
      try {
        setError(null);
        const updatedContact = await ContactService.updateContact(
          id,
          contactData
        );
        setContacts((prev) =>
          prev.map((contact) => (contact.id === id ? updatedContact : contact))
        );
        return updatedContact;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update contact";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Delete a contact
  const deleteContact = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await ContactService.deleteContact(id);
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete contact";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Check for duplicate email
  const checkDuplicate = useCallback(
    async (email: string, excludeId?: string): Promise<boolean> => {
      try {
        return await ContactService.checkDuplicate(email, excludeId);
      } catch (err) {
        console.error("Error checking for duplicates:", err);
        return false;
      }
    },
    []
  );

  // Refresh contacts
  const refresh = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    checkDuplicate,
    refresh,
  };
};

export const useContact = (id: string | null) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ContactService.getContact(id);
      setContact(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contact");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    error,
    refresh: fetchContact,
  };
};
