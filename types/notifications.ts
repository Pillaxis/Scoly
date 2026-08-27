import { UserRole, StaffRole } from "./scoly";

export type NotificationPriority = "info" | "success" | "warning" | "critical";

export type NotificationType =
  | "payment_recorded"
  | "payment_cancelled"
  | "daily_collection_summary"
  | "debt_new"
  | "debt_late"
  | "debt_critical"
  | "due_upcoming"
  | "student_enrolled"
  | "import_completed"
  | "import_warning"
  | "onboarding_welcome"
  | "onboarding_no_students"
  | "onboarding_no_payments"
  | "onboarding_inactive_reminder"
  | "system_error"
  | "system_info"
  | "system_warning"
  | "subscription_activated"
  | "pro_feature_discovered"
  | "staff_invited";

export type NotificationRoleTarget = UserRole | StaffRole | "all";

export interface ScolyNotification {
  id: string;
  school_id: string;
  user_id?: string | null;            // null = visible à tous les membres autorisés de l'école
  target_roles?: string[];           // ['owner', 'director', 'accountant', 'secretary']
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;               // Ex: "/payments", "/debts?filter=critical", "/students"
  action_label?: string;             // Ex: "Voir le reçu", "Relancer", "Voir les échéances"
  entity_type?: "payment" | "student" | "class" | "tuition" | "import_batch" | "system" | "debt" | "subscription";
  entity_id?: string;
  metadata?: Record<string, any>;    // Montant, nom élève, matricule, etc.
  is_read: boolean;
  read_at?: string | null;
  read_by?: string[];                // User IDs des personnes ayant marqué la notification lue
  dedup_key?: string;                // Clé de déduplication anti-spam (ex: upcoming_2026-08-27)
  created_at: string;
}


export type NotificationFilterTab = "all" | "unread" | "alerts" | "payments";
