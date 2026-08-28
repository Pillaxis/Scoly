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
  receipt_prefix: "",
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
  id: "ay-current",
  school_id: "sch-001",
  name: "",
  start_date: "",
  end_date: "",
  is_current: true,
};

export const INITIAL_CLASSES: SchoolClass[] = [];
export const INITIAL_TUITION_PLANS: TuitionPlan[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_REMINDERS: Reminder[] = [];
