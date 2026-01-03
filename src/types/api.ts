export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'success' | 're-upload';

export interface StudentProfile {
  id: string;
  user_id: string;
  name?: string;
  father_name?: string;
  father_mobile?: string;
  mother_name?: string;
  mother_mobile?: string;
  neet_roll_no?: string;
  neet_rank?: number;
  neet_marks?: string;
  application_no?: string;
  dob?: string;
  gender?: string;
  neet_mobile?: string;
  whatsapp_no?: string;
  email?: string;
  permanent_address: Record<string, string>;
  correspondence_address: Record<string, string>;
  bms_counselling_opted: boolean;
  bhs_counselling_opted: boolean;
  max_budget?: string;
  minority: boolean;
  minority_type?: string;
  nri_quota: boolean;
  special_quotas: string[];
  domicile_state?: string;
  single_child: boolean;
  stayed_in_state_since?: string;
  tenth_school_details: Record<string, string>;
  twelfth_school_details: Record<string, string>;
  gap_year: boolean;
  neet_category?: string;
  mentor_id?: string;
  documents_verified: boolean;
  updated_at?: string;
}

export interface StudentProfileUpdate {
  name?: string;
  father_name?: string;
  father_mobile?: string;
  mother_name?: string;
  mother_mobile?: string;
  neet_roll_no?: string;
  neet_rank?: number;
  neet_marks?: string;
  application_no?: string;
  dob?: string;
  gender?: string;
  neet_mobile?: string;
  whatsapp_no?: string;
  email?: string;
  permanent_address?: Record<string, string>;
  correspondence_address?: Record<string, string>;
  bms_counselling_opted?: boolean;
  bhs_counselling_opted?: boolean;
  max_budget?: string;
  minority?: boolean;
  minority_type?: string;
  nri_quota?: boolean;
  special_quotas?: string[];
  domicile_state?: string;
  single_child?: boolean;
  stayed_in_state_since?: string;
  tenth_school_details?: Record<string, string>;
  twelfth_school_details?: Record<string, string>;
  gap_year?: boolean;
  neet_category?: string;
}

export interface RequiredDocument {
  doc_id: string;
  doc_code: string;
  doc_name: string;
  mandatory: boolean;
  category: string;
}

export interface DocumentUploadStatus {
  total_required: number;
  uploaded: number;
  pending: number;
  documents: Array<{
    doc_code: string;
    status: string;
  }>;
}

export interface MentorProfile {
  user_id: string;
  personal_info: Record<string, string>;
  academic_info: Record<string, string>;
  capacity: number;
  assigned_students: number;
  documents_verified: boolean;
  updated_at?: string;
}

export interface MentorProfileUpdate {
  personal_info?: Record<string, string>;
  academic_info?: Record<string, string>;
  capacity?: number;
}

export interface DocumentMetadata {
  id: string;
  owner_id: string;
  owner_role: string;
  owner_name?: string;
  document_type: string;
  document_code: string;
  storage_path: string;
  status: DocumentStatus;
  verifier_id?: string;
  verified_at?: string;
  remarks?: string;
  created_at: string;
}
