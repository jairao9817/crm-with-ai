// Contact types
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  preferences?: Record<string, any>;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  preferences?: Record<string, any>;
}

// Deal types
export type DealStage =
  | "lead"
  | "prospect"
  | "negotiation"
  | "closed-won"
  | "closed-lost";

export interface Deal {
  id: string;
  title: string;
  contact_id?: string;
  user_id: string;
  stage: DealStage;
  monetary_value: number;
  expected_close_date?: string;
  probability_percentage: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Joined data
  contact?: Contact;
}

export interface CreateDealInput {
  title: string;
  contact_id?: string;
  stage?: DealStage;
  monetary_value?: number;
  expected_close_date?: string;
  probability_percentage?: number;
}

export interface UpdateDealInput {
  title?: string;
  contact_id?: string;
  stage?: DealStage;
  monetary_value?: number;
  expected_close_date?: string;
  probability_percentage?: number;
}

// Task types
export type TaskStatus = "pending" | "completed" | "overdue";

export interface Task {
  id: string;
  deal_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  deal?: Deal;
}

export interface CreateTaskInput {
  deal_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  deal_id?: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
}

// Communication types
export type CommunicationType = "phone_call" | "email" | "meeting" | "note";

export interface Communication {
  id: string;
  contact_id: string;
  deal_id?: string;
  type: CommunicationType;
  subject?: string;
  content?: string;
  communication_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  contact?: Contact;
  deal?: Deal;
  notes?: CommunicationNote[];
}

export interface CreateCommunicationInput {
  contact_id: string;
  deal_id?: string;
  type: CommunicationType;
  subject?: string;
  content?: string;
  communication_date?: string;
}

export interface UpdateCommunicationInput {
  contact_id?: string;
  deal_id?: string;
  type?: CommunicationType;
  subject?: string;
  content?: string;
  communication_date?: string;
}

// Communication Notes types
export type CommunicationNoteType =
  | "reply"
  | "follow_up"
  | "general"
  | "important";

export interface CommunicationNote {
  id: string;
  communication_id: string;
  note_content: string;
  note_type: CommunicationNoteType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommunicationNoteInput {
  communication_id: string;
  note_content: string;
  note_type?: CommunicationNoteType;
}

export interface UpdateCommunicationNoteInput {
  note_content?: string;
  note_type?: CommunicationNoteType;
}

// Purchase History types
export type PurchaseStatus = "completed" | "pending" | "refunded" | "cancelled";

export interface PurchaseHistory {
  id: string;
  contact_id: string;
  deal_id?: string;
  date: string;
  amount: number;
  product_service: string;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined data
  contact?: Contact;
  deal?: Deal;
}

export interface CreatePurchaseHistoryInput {
  contact_id: string;
  deal_id?: string;
  date: string;
  amount: number;
  product_service: string;
  status?: PurchaseStatus;
}

export interface UpdatePurchaseHistoryInput {
  contact_id?: string;
  deal_id?: string;
  date?: string;
  amount?: number;
  product_service?: string;
  status?: PurchaseStatus;
}

// UI types
export interface ContactFilters {
  search?: string;
  company?: string;
}

export interface DealFilters {
  stage?: DealStage;
  contact_id?: string;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  deal_id?: string;
  due_date?: string;
  search?: string;
}

export interface CommunicationFilters {
  type?: CommunicationType;
  contact_id?: string;
  deal_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PurchaseHistoryFilters {
  status?: PurchaseStatus;
  contact_id?: string;
  deal_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// AI Persona types
export interface ContactPersona {
  id: string;
  contact_id: string;
  persona_summary: string;
  behavioral_traits: string[];
  communication_preferences: string[];
  buying_patterns: string[];
  generated_at: string;
  created_by: string;
}

export interface GeneratePersonaInput {
  contact_id: string;
  contact_data: {
    contact: Contact;
    deals: Deal[];
    communications: Communication[];
    purchaseHistory: PurchaseHistory[];
  };
}

// AI Objection Handler Types
export interface ObjectionHandlerInput {
  objection: string;
  context?: {
    contact?: Contact;
    deal?: Deal;
    communication?: Communication;
    industry?: string;
    product_service?: string;
  };
}

export interface ObjectionHandlerResponse {
  id: string;
  objection: string;
  suggested_response: string;
  response_strategy: string;
  key_points: string[];
  tone: "professional" | "empathetic" | "confident" | "consultative";
  generated_at: string;
}
