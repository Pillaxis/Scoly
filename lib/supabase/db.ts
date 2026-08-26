/**
 * SCOLY — Supabase Database Abstraction Layer
 * Provides typed CRUD operations for all entities.
 * Falls back gracefully when Supabase is not configured.
 */
import { getSupabaseBrowser, isSupabaseConfigured } from "./client";
import type {
  School,
  AcademicYear,
  SchoolClass,
  TuitionPlan,
  Student,
  Payment,
  Reminder,
  PaymentMethod,
} from "@/types/scoly";

// ─── Helpers ─────────────────────────────────────────────

function sb() {
  return getSupabaseBrowser();
}

// Default school_id used in single-tenant local mode
const DEFAULT_SCHOOL_ID = "sch-001";

// ─── SCHOOL ──────────────────────────────────────────────

export async function fetchSchool(schoolId?: string): Promise<School | null> {
  const client = sb();
  if (!client) return null;

  const { data, error } = await client
    .from("schools")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    slug: data.slug,
    logo_url: data.logo_url,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city || "Lomé",
    country: data.country || "Togo",
    currency: data.currency || "FCFA",
    receipt_prefix: data.receipt_prefix || "REC-",
    receipt_counter: data.receipt_counter || 1,
  };
}

export async function upsertSchool(school: Partial<School>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  const { error } = await client
    .from("schools")
    .upsert({
      id: school.id,
      name: school.name,
      code: school.code,
      slug: school.slug || school.code?.toLowerCase().replace(/\s+/g, "-"),
      phone: school.phone,
      email: school.email,
      address: school.address,
      city: school.city,
      country: school.country,
      currency: school.currency,
      receipt_prefix: school.receipt_prefix,
      receipt_counter: school.receipt_counter,
    })
    .select();

  return !error;
}

// ─── ACADEMIC YEAR ───────────────────────────────────────

export async function fetchAcademicYear(schoolId: string): Promise<AcademicYear | null> {
  const client = sb();
  if (!client) return null;

  const { data, error } = await client
    .from("academic_years")
    .select("*")
    .eq("school_id", schoolId)
    .eq("is_current", true)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    school_id: data.school_id,
    name: data.name,
    start_date: data.start_date,
    end_date: data.end_date,
    is_current: data.is_current,
  };
}

// ─── CLASSES ─────────────────────────────────────────────

export async function fetchClasses(schoolId: string, yearId: string): Promise<SchoolClass[]> {
  const client = sb();
  if (!client) return [];

  const { data, error } = await client
    .from("classes")
    .select("*")
    .eq("school_id", schoolId)
    .eq("academic_year_id", yearId)
    .order("order_index", { ascending: true });

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    school_id: c.school_id,
    academic_year_id: c.academic_year_id,
    name: c.name,
    level: c.level || "Secondaire",
    order_index: c.order_index || 0,
    series: c.series,
    cycle_year: c.cycle_year,
    branch: c.branch,
    is_custom: c.is_custom,
    description: c.description,
  }));
}

export async function upsertClass(cls: Partial<SchoolClass>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  const { error } = await client.from("classes").upsert(cls).select();
  return !error;
}

export async function deleteClassDb(classId: string): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  const { error } = await client.from("classes").delete().eq("id", classId);
  return !error;
}

// ─── STUDENTS ────────────────────────────────────────────

export async function fetchStudents(schoolId: string, yearId: string): Promise<Student[]> {
  const client = sb();
  if (!client) return [];

  // Fetch students with their parent info via student_parents join
  const { data, error } = await client
    .from("students")
    .select(`
      *,
      student_parents!inner(
        parent:parents(*)
      )
    `)
    .eq("school_id", schoolId)
    .eq("academic_year_id", yearId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((s: any) => {
    const parentData = s.student_parents?.[0]?.parent || {};
    const classEntry = s.class_id; // class name must be resolved separately or denormalized

    return {
      id: s.id,
      school_id: s.school_id,
      academic_year_id: s.academic_year_id,
      class_id: s.class_id || "",
      class_name: s.class_name || "",
      matricule: s.matricule,
      first_name: s.first_name,
      last_name: s.last_name,
      gender: s.gender,
      birth_date: s.birth_date,
      photo_url: s.photo_url,
      is_active: s.is_active !== false,
      discount_amount: Number(s.discount_amount) || 0,
      discount_reason: s.discount_reason,
      custom_tuition: s.custom_tuition ? Number(s.custom_tuition) : undefined,
      parent: {
        id: parentData.id || "",
        school_id: parentData.school_id || schoolId,
        full_name: parentData.full_name || "",
        relationship: parentData.relationship || "Parent",
        phone_primary: parentData.phone_primary || "",
        phone_whatsapp: parentData.phone_whatsapp,
        email: parentData.email,
        profession: parentData.profession,
        address: parentData.address,
      },
      created_at: s.created_at,
    };
  });
}

export async function insertStudentDb(
  student: Omit<Student, "parent"> & { parent: any },
  schoolId: string,
  yearId: string
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  // 1. Insert parent
  const { data: parentData, error: parentError } = await client
    .from("parents")
    .insert({
      school_id: schoolId,
      full_name: student.parent.full_name,
      relationship: student.parent.relationship,
      phone_primary: student.parent.phone_primary,
      phone_whatsapp: student.parent.phone_whatsapp,
      email: student.parent.email,
      profession: student.parent.profession,
      address: student.parent.address,
    })
    .select()
    .single();

  if (parentError || !parentData) return false;

  // 2. Insert student
  const { data: studentData, error: studentError } = await client
    .from("students")
    .insert({
      id: student.id,
      school_id: schoolId,
      academic_year_id: yearId,
      class_id: student.class_id || null,
      matricule: student.matricule,
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      birth_date: student.birth_date || null,
      is_active: true,
      discount_amount: student.discount_amount || 0,
      discount_reason: student.discount_reason,
    })
    .select()
    .single();

  if (studentError || !studentData) return false;

  // 3. Link student to parent
  await client.from("student_parents").insert({
    student_id: studentData.id,
    parent_id: parentData.id,
    is_primary_contact: true,
  });

  return true;
}

// ─── PAYMENTS ────────────────────────────────────────────

export async function fetchPayments(schoolId: string, yearId: string): Promise<Payment[]> {
  const client = sb();
  if (!client) return [];

  const { data, error } = await client
    .from("payments")
    .select("*")
    .eq("school_id", schoolId)
    .eq("academic_year_id", yearId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    school_id: p.school_id,
    student_id: p.student_id,
    student_name: p.student_name || "",
    matricule: p.matricule || "",
    class_name: p.class_name || "",
    academic_year_id: p.academic_year_id,
    amount: Number(p.amount),
    allocated_amount: p.allocated_amount ? Number(p.allocated_amount) : undefined,
    credit_amount: p.credit_amount ? Number(p.credit_amount) : undefined,
    is_advance: p.is_advance || false,
    payment_date: p.payment_date,
    payment_method: p.payment_method || "cash",
    transaction_ref: p.transaction_ref,
    receipt_number: p.receipt_number,
    notes: p.notes,
    recorded_by_name: p.recorded_by_name,
    status: p.status || "completed",
    parent_name: p.parent_name,
    cancelled_at: p.cancelled_at,
    cancellation_reason: p.cancellation_reason,
    idempotency_key: p.idempotency_key,
    created_at: p.created_at,
  }));
}

export async function insertPaymentDb(payment: Partial<Payment>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  const { error } = await client.from("payments").insert(payment).select();
  return !error;
}

// ─── TUITION PLANS ───────────────────────────────────────

export async function fetchTuitionPlans(schoolId: string, yearId: string): Promise<TuitionPlan[]> {
  const client = sb();
  if (!client) return [];

  const { data, error } = await client
    .from("tuition_plans")
    .select(`
      *,
      tuition_installments(*)
    `)
    .eq("school_id", schoolId)
    .eq("academic_year_id", yearId);

  if (error || !data) return [];

  return data.map((tp: any) => ({
    id: tp.id,
    school_id: tp.school_id,
    academic_year_id: tp.academic_year_id,
    class_id: tp.class_id,
    class_name: tp.class_name,
    total_amount: Number(tp.total_amount),
    description: tp.description,
    installments: (tp.tuition_installments || [])
      .sort((a: any, b: any) => a.installment_order - b.installment_order)
      .map((inst: any) => ({
        id: inst.id,
        tuition_plan_id: inst.tuition_plan_id,
        title: inst.title,
        due_date: inst.due_date,
        amount: Number(inst.amount),
        installment_order: inst.installment_order,
      })),
  }));
}

// ─── REMINDERS ───────────────────────────────────────────

export async function fetchReminders(schoolId: string): Promise<Reminder[]> {
  const client = sb();
  if (!client) return [];

  const { data, error } = await client
    .from("reminders")
    .select("*")
    .eq("school_id", schoolId)
    .order("sent_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    school_id: r.school_id,
    student_id: r.student_id,
    student_name: r.student_name || "",
    parent_id: r.parent_id,
    parent_name: r.parent_name || "",
    parent_phone: r.parent_phone || "",
    channel: r.channel,
    message_content: r.message_content,
    amount_due: Number(r.amount_due),
    days_late: r.days_late || 0,
    status: r.status || "sent",
    sent_at: r.sent_at,
  }));
}

// ─── PAYMENT METHODS CONFIG ──────────────────────────────

export interface PaymentMethodConfig {
  key: string;
  label: string;
  is_active: boolean;
  order_index: number;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { key: "cash", label: "Espèces", is_active: true, order_index: 0 },
  { key: "tmoney", label: "TMoney", is_active: true, order_index: 1 },
  { key: "flooz", label: "Flooz", is_active: true, order_index: 2 },
  { key: "bank_transfer", label: "Virement bancaire", is_active: true, order_index: 3 },
  { key: "cheque", label: "Chèque", is_active: true, order_index: 4 },
  { key: "other", label: "Autre", is_active: true, order_index: 5 },
];

export function getDefaultPaymentMethods(): PaymentMethodConfig[] {
  return DEFAULT_PAYMENT_METHODS;
}

// ─── GENERIC SYNC HELPER ─────────────────────────────────

export { isSupabaseConfigured };
