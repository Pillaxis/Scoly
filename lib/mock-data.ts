import { School, AcademicYear, SchoolClass, TuitionPlan, Student, Payment, Reminder } from "@/types/scoly";

export const INITIAL_SCHOOL: School = {
  id: "sch-001",
  name: "",
  code: "",
  slug: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  currency: "FCFA",
  receipt_prefix: "REC-25-",
  receipt_counter: 0,
  education_types: [],
  onboarding_completed: false,
  onboarding_current_step: 1,
  notification_preferences: {
    unpaid_alerts: true,
    upcoming_deadlines: true,
    payment_received: true,
    reminders_due: true,
  },
};

export const INITIAL_ACADEMIC_YEAR: AcademicYear = {
  id: "ay-2025-2026",
  school_id: "sch-001",
  name: "2025-2026",
  start_date: "2025-09-15",
  end_date: "2026-06-30",
  is_current: true,
};

export const INITIAL_CLASSES: SchoolClass[] = [
  // --- MATERNELLE ---
  { id: "cls-ci-1", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CI Maternelle (1ère année)", level: "Maternelle", order_index: 1 },
  { id: "cls-ci-2", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CI Maternelle (2ème année)", level: "Maternelle", order_index: 2 },

  // --- PRIMAIRE ---
  { id: "cls-cp1", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CP1", level: "Primaire", order_index: 3 },
  { id: "cls-cp2", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CP2", level: "Primaire", order_index: 4 },
  { id: "cls-ce1", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CE1", level: "Primaire", order_index: 5 },
  { id: "cls-ce2", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CE2", level: "Primaire", order_index: 6 },
  { id: "cls-cm1", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CM1", level: "Primaire", order_index: 7 },
  { id: "cls-cm2", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "CM2", level: "Primaire", order_index: 8 },

  // --- COLLÈGE ---
  { id: "cls-6e", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "6e", level: "Collège", order_index: 9 },
  { id: "cls-5e", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "5e", level: "Collège", order_index: 10 },
  { id: "cls-4e", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "4e", level: "Collège", order_index: 11 },
  { id: "cls-3e", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "3e", level: "Collège", order_index: 12 },

  // --- LYCÉE ---
  { id: "cls-seconde", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "Seconde", level: "Lycée", order_index: 13 },
  { id: "cls-premiere", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "Première", level: "Lycée", order_index: 14 },
  { id: "cls-terminale", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "Terminale", level: "Lycée", order_index: 15 },

  // --- UNIVERSITÉ / SUPÉRIEUR ---
  { id: "cls-universite", school_id: "sch-001", academic_year_id: "ay-2025-2026", name: "Université", level: "Enseignement Supérieur", order_index: 16 },
];

export const INITIAL_TUITION_PLANS: TuitionPlan[] = [];

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_REMINDERS: Reminder[] = [];
