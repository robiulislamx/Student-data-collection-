export type InstitutionType = 'School' | 'College' | 'Polytechnic' | 'University' | 'Madrasa' | 'Other';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StudentSubmission {
  id: string; // Auto-generated UUID or ID
  student_id: string; // Numeric/Alphanumeric Student ID
  full_name: string;
  fathers_name: string;
  mothers_name: string;
  gender: string;
  dob: string;
  blood_group: string;
  nationality: string;

  // Academic info
  institution: string;
  institution_type: InstitutionType;
  division: string;
  department: string;
  session: string;
  semester: string;
  roll_number: string;
  registration_number: string;

  // Contact info
  mobile: string;
  alt_mobile: string;
  email: string;

  // Address info
  present_address: string;
  permanent_address: string;

  // Additional info
  profile_picture?: string; // Base64 string or mock link
  national_id?: string;
  birth_cert?: string;
  guardian_info: string;
  emergency_contact: string;

  // Dynamic custom values stored as key-value pairs
  custom_fields?: Record<string, string | boolean | string[]>;

  status: SubmissionStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DynamicField {
  id: string;
  name: string; // e.g. "ext_blood_donor", "ext_hobby"
  label: string; // e.g. "Are you a blood donor?", "Interests"
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[]; // for dropdown, radio, or checkbox
  category: 'personal' | 'academic' | 'contact' | 'address' | 'additional';
  placeholder?: string;
}

export interface User {
  id: string;
  role: 'admin' | 'student';
  email: string;
  password?: string;
  full_name: string;
}

export interface ApprovalLog {
  id: string;
  student_id: string;
  student_name: string;
  action: 'Approve' | 'Reject';
  reason?: string;
  admin_email: string;
  timestamp: string;
}

export interface NotificationLog {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  type: 'AdminAlert' | 'StudentApproval' | 'StudentRejection';
  status: 'sent' | 'failed';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface GoogleSheetRow {
  student_id: string;
  full_name: string;
  institution: string;
  department: string;
  email: string;
  mobile: string;
  status: string;
  synced_at: string;
}

export interface DatabaseState {
  submissions: StudentSubmission[];
  dynamic_fields: DynamicField[];
  logs: AuditLog[];
  notifications: NotificationLog[];
  approval_logs: ApprovalLog[];
  sheet_rows: GoogleSheetRow[];
  settings: {
    sheet_url: string;
    sheet_sync_enabled: boolean;
    auto_email_alerts: boolean;
    admin_notify_email: string;
  };
}
