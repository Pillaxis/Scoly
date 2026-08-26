import { PaymentMethod, StaffRole } from "./scoly";

export type ImportSourceType = "excel" | "csv" | "google_sheets" | "photo_ocr";

export type ImportTargetCategory = "students_and_payments" | "students_only" | "payments_only";

export type TargetFieldKey =
  // Student
  | "first_name"
  | "last_name"
  | "full_name"
  | "matricule"
  | "gender"
  | "birth_date"
  | "class_name"
  // Parent
  | "parent_name"
  | "parent_phone"
  | "parent_whatsapp"
  | "parent_relationship"
  | "parent_profession"
  | "parent_address"
  // Finance & Tuition
  | "tuition_amount"
  | "discount_amount"
  | "discount_reason"
  // Payment
  | "payment_amount"
  | "payment_date"
  | "payment_method"
  | "payment_ref"
  | "payment_notes";

export interface TargetFieldDefinition {
  key: TargetFieldKey;
  label: string;
  category: "student" | "parent" | "finance" | "payment";
  isRequired: boolean;
  synonyms: string[];
  example: string;
}

export interface ColumnMappingRule {
  targetKey: TargetFieldKey | "";
  sourceHeader: string;
  confidence: number;
  isAutoDetected: boolean;
}

export interface DuplicateMatchInfo {
  matchedStudentId: string;
  matchedStudentName: string;
  matchedMatricule?: string;
  matchedClassName?: string;
  matchReason: "matricule" | "full_name" | "parent_phone" | "name_and_class";
  action: "skip" | "update" | "create_anyway";
}

export interface ValidatedImportRow {
  rowIndex: number;
  rawData: Record<string, any>;
  parsedStudent: {
    first_name: string;
    last_name: string;
    matricule?: string;
    gender: "M" | "F";
    birth_date?: string;
    class_id?: string;
    class_name: string;
    custom_tuition?: number;
    discount_amount?: number;
    discount_reason?: string;
  };
  parsedParent?: {
    full_name: string;
    relationship: "Père" | "Mère" | "Tuteur" | "Autre";
    phone_primary: string;
    phone_whatsapp?: string;
    profession?: string;
    address?: string;
  };
  parsedPayment?: {
    amount: number;
    payment_date: string;
    payment_method: PaymentMethod;
    transaction_ref?: string;
    notes?: string;
  };
  status: "valid" | "warning" | "error" | "duplicate";
  errors: string[];
  warnings: string[];
  duplicateInfo?: DuplicateMatchInfo;
  confidenceScore?: number; // 0-100
  isExcluded?: boolean;
}

export interface ImageQualityDiagnosis {
  isAcceptable: boolean;
  brightnessScore: number; // 0 - 100
  contrastScore: number;   // 0 - 100
  sharpnessScore: number;  // 0 - 100
  issues: ("too_dark" | "too_bright" | "blurry" | "low_contrast" | "skewed")[];
  recommendations: string[];
}

export interface OCRLineResult {
  id: string;
  rawText: string;
  confidence: number;
  detectedFields: Partial<Record<TargetFieldKey, string>>;
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
  percentage: number;
  status: "idle" | "running" | "paused" | "completed" | "error";
  currentActionDescription: string;
}

export interface ImportSummary {
  batchId: string;
  sourceType: ImportSourceType;
  fileName?: string;
  totalDetected: number;
  studentsImported: number;
  studentsUpdated: number;
  parentsAssociated: number;
  paymentsImported: number;
  rowsSkipped: number;
  errorsCount: number;
  importedAt: string;
  academicYearId: string;
  academicYearName: string;
}

export interface ImportBatchRecord {
  id: string;
  school_id: string;
  academic_year_id: string;
  user_id?: string;
  user_name?: string;
  source_type: ImportSourceType;
  file_name?: string;
  total_rows: number;
  imported_students_count: number;
  imported_payments_count: number;
  errors_count: number;
  duplicates_count: number;
  payload_summary?: Record<string, any>;
  created_at: string;
}
