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
