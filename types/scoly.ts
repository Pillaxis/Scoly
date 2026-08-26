export type UserRole = 'owner' | 'director' | 'accountant' | 'secretary';

export type StaffRole = 'directeur' | 'comptable' | 'secretaire';

export interface StaffPermission {
  can_collect_payments: boolean;      // Encaisser & émettre des reçus
  can_manage_students: boolean;       // Inscrire & modifier les fiches élèves
  can_manage_tuition: boolean;        // Configurer les tarifs & tranches
  can_send_reminders: boolean;        // Envoyer les relances WhatsApp
  can_view_financial_stats: boolean;  // Voir le chiffre d'affaires & trésorerie
  can_manage_settings: boolean;       // Modifier les paramètres & l'équipe
}

export interface StaffMember {
  id: string;
  school_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  permissions: StaffPermission;
  status: 'actif' | 'invite';
  invited_at: string;
}

export type PaymentMethod = string;

export type PaymentStatus = 'up_to_date' | 'upcoming' | 'late' | 'critical' | 'credit';

export interface School {
  id: string;
  name: string;
  code: string;
  slug: string;
  logo_url?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  receipt_prefix: string;
  receipt_counter: number;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // "2025-2026"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: string; // "6ème A", "Terminale G2", "CP1 A", etc.
  level: string; // "Maternelle", "Primaire", "Collège", "Lycée", "Enseignement Supérieur", "Formation Professionnelle", "Autre"
  order_index: number;
  series?: string; // optionnel: série (G2, A4, C, D, F...)
  cycle_year?: string; // optionnel: année de cycle (1ère année, 2ème année, L1, L2...)
  branch?: string; // optionnel: filière / branche
  is_custom?: boolean;
  description?: string;
}

export type ClassRoom = SchoolClass;

export interface TuitionInstallment {
  id: string;
  tuition_plan_id: string;
  title: string;
  due_date: string;
  amount: number;
  installment_order: number;
}

export interface TuitionPlan {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  class_name?: string;
  total_amount: number;
  description?: string;
  installments: TuitionInstallment[];
}

export interface Parent {
  id: string;
  school_id: string;
  full_name: string;
  relationship: 'Père' | 'Mère' | 'Tuteur' | 'Autre';
  phone_primary: string;
  phone_whatsapp?: string;
  email?: string;
  profession?: string;
  address?: string;
}

export interface Student {
  id: string;
  school_id: string;
  academic_year_id: string;
  class_id: string;
  class_name: string;
  matricule: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  birth_date?: string;
  photo_url?: string;
  is_active: boolean;
  discount_amount: number;
  discount_reason?: string;
  custom_tuition?: number;
  parent: Parent;
  created_at: string;
}

export interface Payment {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  matricule: string;
  class_name: string;
  academic_year_id: string;
  amount: number;
  allocated_amount?: number;        // Montant réellement affecté à la dette
  credit_amount?: number;           // Montant d'avance / surplus crédité
  is_advance?: boolean;             // True si versement avec avance
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_ref?: string;
  receipt_number: string;
  notes?: string;
  recorded_by_name?: string;
  parent_name?: string;
  parent_phone?: string;
  status?: 'completed' | 'cancelled';
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by_name?: string;
  idempotency_key?: string;
  created_at: string;
}

export interface StudentFinancialSummary {
  student_id: string;
  gross_tuition: number;
  discount_amount: number;
  net_tuition: number;
  total_due: number;               // Total réellement dû (extensible aux frais annexes)
  total_paid: number;              // Cumul total de tous les paiements valides
  allocated_paid: number;          // Montant total affecté à la dette
  balance_due: number;             // Solde restant STRICTEMENT >= 0 (JAMAIS négatif)
  credit_amount: number;           // Crédit / Avance disponible (quand total_paid > total_due)
  has_advance: boolean;            // True si credit_amount > 0
  status: PaymentStatus;           // 'up_to_date' | 'upcoming' | 'late' | 'critical' | 'credit'
  days_late: number;
  next_due_date?: string;
  next_due_amount?: number;
}

export interface Reminder {
  id: string;
  student_id: string;
  student_name: string;
  parent_name: string;
  parent_phone: string;
  channel: 'whatsapp' | 'sms' | 'phone_call' | 'email';
  message_content: string;
  amount_due: number;
  days_late: number;
  status: 'prepared' | 'sent' | 'delivered';
  sent_at: string;
}

export interface DashboardMetrics {
  collected_today: number;
  collected_total: number;
  total_expected: number;
  total_remaining: number;
  total_credit: number;            // Total cumulé des avances/crédits
  recovery_rate: number;           // Pourcentage de recouvrement calculé sur la dette réelle
  students_count: number;
  students_up_to_date: number;
  students_credit: number;         // Nombre d'élèves avec avance/crédit
  students_upcoming: number;
  students_late: number;
  students_critical: number;
  critical_alerts_count: number;
}

export interface AuditLogRecord {
  id: string;
  school_id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: any;
  created_at: string;
}
