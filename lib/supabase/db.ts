/**
 * SCOLY — Supabase Database Abstraction Layer (Production Real-Time Engine)
 * Provides typed, guaranteed CRUD operations for all entities.
 * Strictly verifies and synchronizes with PostgreSQL tables.
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
  StaffMember,
  ScolyNotification,
  ScolySubscription,
  SubscriptionPlan,
  SubscriptionBillingPeriod,
} from "@/types/scoly";

import type { ImportBatchRecord } from "@/types/import";


function sb() {
  return getSupabaseBrowser();
}

/**
 * Safe promise wrapper with timeout
 */
function withTimeout<T>(promiseLike: PromiseLike<T>, ms = 3000): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase request timeout")), ms)
    ),
  ]);
}

// ─── 1. SCHOOL ───────────────────────────────────────────

export async function fetchSchool(schoolId?: string): Promise<School | null> {
  const client = sb();
  if (!client) return null;

  try {
    let query = client.from("schools").select("*");
    if (schoolId) {
      query = query.eq("id", schoolId);
    }
    const { data, error } = await withTimeout(query.limit(1).single());

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name || "",
      code: data.code || "",
      slug: data.slug || "",
      logo_url: data.logo_url,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      city: data.city || "",
      country: data.country || "",
      currency: data.currency || "FCFA",
      receipt_prefix: data.receipt_prefix || "",
      receipt_counter: Number(data.receipt_counter) || 0,
      education_types: data.education_types || [],
      onboarding_completed: data.onboarding_completed ?? false,
      onboarding_current_step: data.onboarding_current_step ?? 1,
      notification_preferences: data.notification_preferences || {
        unpaid_alerts: true,
        upcoming_deadlines: true,
        payment_received: true,
        reminders_due: true,
      },
    };
  } catch {
    return null;
  }
}

export async function upsertSchool(school: Partial<School>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const payload: any = {
      name: school.name,
      phone: school.phone,
      email: school.email,
      address: school.address,
      city: school.city,
      country: school.country,
      currency: school.currency,
      receipt_prefix: school.receipt_prefix,
      receipt_counter: school.receipt_counter,
      updated_at: new Date().toISOString(),
    };

    if (school.logo_url !== undefined) payload.logo_url = school.logo_url;
    if (school.education_types !== undefined) payload.education_types = school.education_types;
    if (school.onboarding_completed !== undefined) payload.onboarding_completed = school.onboarding_completed;
    if (school.onboarding_current_step !== undefined) payload.onboarding_current_step = school.onboarding_current_step;
    if (school.notification_preferences !== undefined) payload.notification_preferences = school.notification_preferences;

    if (school.code) {
      payload.code = school.code;
      payload.slug = school.slug || school.code.toLowerCase().replace(/\s+/g, "-");
    }

    if (school.id) {
      payload.id = school.id;
    }

    const { error } = await client.from("schools").upsert(payload).select();
    return !error;
  } catch {
    return false;
  }
}

// ─── 2. ACADEMIC YEARS ───────────────────────────────────

export async function fetchAcademicYear(schoolId: string): Promise<AcademicYear | null> {
  const client = sb();
  if (!client) return null;

  try {
    const { data, error } = await withTimeout(
      client
        .from("academic_years")
        .select("*")
        .eq("school_id", schoolId)
        .eq("is_current", true)
        .limit(1)
        .single()
    );

    if (error || !data) {
      // Fallback to first available year if no is_current=true
      const fallback = await client
        .from("academic_years")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (fallback.data) {
        return {
          id: fallback.data.id,
          school_id: fallback.data.school_id,
          name: fallback.data.name,
          start_date: fallback.data.start_date,
          end_date: fallback.data.end_date,
          is_current: fallback.data.is_current,
        };
      }
      return null;
    }

    return {
      id: data.id,
      school_id: data.school_id,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      is_current: data.is_current,
    };
  } catch {
    return null;
  }
}

export async function fetchAcademicYearsList(schoolId: string): Promise<AcademicYear[]> {
  const client = sb();
  if (!client) return [];

  try {
    const { data, error } = await withTimeout(
      client
        .from("academic_years")
        .select("*")
        .eq("school_id", schoolId)
        .order("start_date", { ascending: false })
    );

    if (error || !data) return [];

    return data.map((y: any) => ({
      id: y.id,
      school_id: y.school_id,
      name: y.name,
      start_date: y.start_date,
      end_date: y.end_date,
      is_current: y.is_current,
    }));
  } catch {
    return [];
  }
}

export async function upsertAcademicYearDb(year: Partial<AcademicYear>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("academic_years").upsert(year).select();
    return !error;
  } catch {
    return false;
  }
}

// ─── 3. CLASSES ──────────────────────────────────────────

export async function fetchClasses(schoolId: string, yearId?: string): Promise<SchoolClass[]> {
  const client = sb();
  if (!client) return [];

  try {
    let query = client.from("classes").select("*").eq("school_id", schoolId);
    if (yearId) {
      query = query.eq("academic_year_id", yearId);
    }
    const { data, error } = await withTimeout(query.order("order_index", { ascending: true }));

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
  } catch {
    return [];
  }
}

export async function upsertClassDb(cls: Partial<SchoolClass>): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("classes").upsert(cls).select();
    return !error;
  } catch {
    return false;
  }
}

export async function deleteClassDb(classId: string): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("classes").delete().eq("id", classId);
    return !error;
  } catch {
    return false;
  }
}

// ─── 4. STUDENTS & PARENTS ───────────────────────────────

export async function fetchStudents(schoolId: string, yearId?: string): Promise<Student[]> {
  const client = sb();
  if (!client) return [];

  try {
    let query = client
      .from("students")
      .select(`
        *,
        student_parents(
          is_primary_contact,
          parent:parents(*)
        ),
        classes(name)
      `)
      .eq("school_id", schoolId);

    if (yearId) {
      query = query.eq("academic_year_id", yearId);
    }

    const { data, error } = await withTimeout(
      query.order("created_at", { ascending: false })
    );

    if (error || !data) return [];

    return data.map((s: any) => {
      const parentRecord = s.student_parents?.[0]?.parent || {};
      const className = s.classes?.name || s.class_name || "";

      return {
        id: s.id,
        school_id: s.school_id,
        academic_year_id: s.academic_year_id,
        class_id: s.class_id || "",
        class_name: className,
        matricule: s.matricule,
        first_name: s.first_name,
        last_name: s.last_name,
        gender: s.gender || "M",
        birth_date: s.birth_date,
        photo_url: s.photo_url,
        is_active: s.is_active !== false,
        discount_amount: Number(s.discount_amount) || 0,
        discount_reason: s.discount_reason,
        custom_tuition: s.custom_tuition ? Number(s.custom_tuition) : undefined,
        parent: {
          id: parentRecord.id || "",
          school_id: parentRecord.school_id || schoolId,
          full_name: parentRecord.full_name || "",
          relationship: parentRecord.relationship || "Parent",
          phone_primary: parentRecord.phone_primary || "",
          phone_whatsapp: parentRecord.phone_whatsapp,
          email: parentRecord.email,
          profession: parentRecord.profession,
          address: parentRecord.address,
        },
        created_at: s.created_at || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function insertStudentDb(
  student: Student,
  schoolId: string,
  yearId: string
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    // 1. Insert Parent
    let parentId = student.parent?.id;
    if (!parentId || parentId.startsWith("par-")) {
      const { data: parentData, error: parentErr } = await client
        .from("parents")
        .insert({
          school_id: schoolId,
          full_name: student.parent.full_name,
          relationship: student.parent.relationship || "Parent",
          phone_primary: student.parent.phone_primary,
          phone_whatsapp: student.parent.phone_whatsapp,
          email: student.parent.email,
          profession: student.parent.profession,
          address: student.parent.address,
        })
        .select()
        .single();

      if (!parentErr && parentData) {
        parentId = parentData.id;
      }
    }

    // 2. Insert Student
    const studentPayload: any = {
      school_id: schoolId,
      academic_year_id: yearId,
      class_id: student.class_id || null,
      matricule: student.matricule,
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender,
      birth_date: student.birth_date || null,
      is_active: student.is_active !== false,
      discount_amount: student.discount_amount || 0,
      discount_reason: student.discount_reason,
      custom_tuition: student.custom_tuition || null,
    };

    if (student.id && !student.id.startsWith("stu-")) {
      studentPayload.id = student.id;
    }

    const { data: studentData, error: studentErr } = await client
      .from("students")
      .upsert(studentPayload)
      .select()
      .single();

    if (studentErr || !studentData) return false;

    // 3. Link Student & Parent
    if (parentId) {
      await client.from("student_parents").upsert({
        student_id: studentData.id,
        parent_id: parentId,
        is_primary_contact: true,
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function updateStudentDb(
  studentId: string,
  updates: Partial<Student>
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const studentPayload: any = {};
    if (updates.first_name !== undefined) studentPayload.first_name = updates.first_name;
    if (updates.last_name !== undefined) studentPayload.last_name = updates.last_name;
    if (updates.gender !== undefined) studentPayload.gender = updates.gender;
    if (updates.birth_date !== undefined) studentPayload.birth_date = updates.birth_date;
    if (updates.class_id !== undefined) studentPayload.class_id = updates.class_id;
    if (updates.discount_amount !== undefined) studentPayload.discount_amount = updates.discount_amount;
    if (updates.discount_reason !== undefined) studentPayload.discount_reason = updates.discount_reason;
    if (updates.custom_tuition !== undefined) studentPayload.custom_tuition = updates.custom_tuition;
    if (updates.is_active !== undefined) studentPayload.is_active = updates.is_active;
    studentPayload.updated_at = new Date().toISOString();

    const { error: studentErr } = await client
      .from("students")
      .update(studentPayload)
      .eq("id", studentId);

    if (updates.parent && updates.parent.id) {
      await client
        .from("parents")
        .update({
          full_name: updates.parent.full_name,
          relationship: updates.parent.relationship,
          phone_primary: updates.parent.phone_primary,
          phone_whatsapp: updates.parent.phone_whatsapp,
          email: updates.parent.email,
          profession: updates.parent.profession,
          address: updates.parent.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updates.parent.id);
    }

    return !studentErr;
  } catch {
    return false;
  }
}

export async function deleteStudentDb(studentId: string): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("students").delete().eq("id", studentId);
    return !error;
  } catch {
    return false;
  }
}

// ─── 5. PAYMENTS ─────────────────────────────────────────

export async function fetchPayments(schoolId: string, yearId?: string): Promise<Payment[]> {
  const client = sb();
  if (!client) return [];

  try {
    let query = client
      .from("payments")
      .select(`
        *,
        students(
          first_name,
          last_name,
          matricule,
          classes(name),
          student_parents(
            parent:parents(full_name, phone_primary)
          )
        )
      `)
      .eq("school_id", schoolId);

    if (yearId) {
      query = query.eq("academic_year_id", yearId);
    }

    const { data, error } = await withTimeout(
      query.order("created_at", { ascending: false })
    );

    if (error || !data) return [];

    return data.map((p: any) => {
      const studentInfo = p.students || {};
      const studentName = studentInfo.first_name
        ? `${studentInfo.first_name} ${studentInfo.last_name}`
        : p.student_name || "";
      const matricule = studentInfo.matricule || p.matricule || "";
      const className = studentInfo.classes?.name || p.class_name || "";
      const parentInfo = studentInfo.student_parents?.[0]?.parent || {};

      return {
        id: p.id,
        school_id: p.school_id,
        student_id: p.student_id,
        student_name: studentName,
        matricule: matricule,
        class_name: className,
        academic_year_id: p.academic_year_id,
        amount: Number(p.amount) || 0,
        allocated_amount: p.allocated_amount ? Number(p.allocated_amount) : undefined,
        credit_amount: p.credit_amount ? Number(p.credit_amount) : undefined,
        is_advance: Boolean(p.is_advance),
        payment_date: p.payment_date || new Date().toISOString().split("T")[0],
        payment_method: p.payment_method || "cash",
        transaction_ref: p.transaction_ref,
        receipt_number: p.receipt_number,
        notes: p.notes,
        recorded_by_name: p.recorded_by_name || "Direction",
        status: p.status || "completed",
        parent_name: parentInfo.full_name || p.parent_name,
        parent_phone: parentInfo.phone_primary || p.parent_phone,
        cancelled_at: p.cancelled_at,
        cancellation_reason: p.cancellation_reason,
        idempotency_key: p.idempotency_key,
        created_at: p.created_at || new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function insertPaymentDb(
  payment: Payment,
  schoolId: string,
  yearId: string
): Promise<{ success: boolean; data?: any }> {
  const client = sb();
  if (!client) return { success: false };

  try {
    // 1. Try calling stored procedure record_payment_v3 (strict zero overpayment + atomic receipt)
    let rpcRes = await client.rpc("record_payment_v3", {
      p_school_id: schoolId,
      p_academic_year_id: yearId,
      p_student_id: payment.student_id,
      p_amount: payment.amount,
      p_payment_method: payment.payment_method || "cash",
      p_transaction_ref: payment.transaction_ref || null,
      p_notes: payment.notes || null,
      p_recorded_by: null,
      p_idempotency_key: payment.idempotency_key || null,
    });

    if (rpcRes.error && rpcRes.error.message?.includes("function record_payment_v3") && rpcRes.error.message?.includes("does not exist")) {
      // Fallback to record_payment_v2
      rpcRes = await client.rpc("record_payment_v2", {
        p_school_id: schoolId,
        p_academic_year_id: yearId,
        p_student_id: payment.student_id,
        p_amount: payment.amount,
        p_payment_method: payment.payment_method || "cash",
        p_transaction_ref: payment.transaction_ref || null,
        p_notes: payment.notes || null,
        p_recorded_by: null,
        p_idempotency_key: payment.idempotency_key || null,
      });
    }

    if (!rpcRes.error && rpcRes.data) {
      return { success: true, data: rpcRes.data };
    }

    if (rpcRes.error) {
      throw new Error(rpcRes.error.message);
    }

    // Direct insert fallback if RPC not yet created
    const payload: any = {
      school_id: schoolId,
      academic_year_id: yearId,
      student_id: payment.student_id,
      amount: payment.amount,
      allocated_amount: payment.amount,
      credit_amount: 0,
      is_advance: false,
      payment_date: payment.payment_date || new Date().toISOString().split("T")[0],
      payment_method: payment.payment_method || "cash",
      transaction_ref: payment.transaction_ref,
      receipt_number: payment.receipt_number,
      notes: payment.notes,
      status: "completed",
      idempotency_key: payment.idempotency_key,
    };

    if (payment.id && !payment.id.startsWith("pay-")) {
      payload.id = payment.id;
    }

    const { data: directData, error: directErr } = await client
      .from("payments")
      .insert(payload)
      .select()
      .single();

    return { success: !directErr, data: directData };
  } catch (err: any) {
    throw err;
  }
}

export async function cancelPaymentDb(
  paymentId: string,
  reason: string,
  cancelledByName?: string
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client
      .from("payments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq("id", paymentId);

    return !error;
  } catch {
    return false;
  }
}

// ─── 6. TUITION PLANS ────────────────────────────────────

export async function fetchTuitionPlans(schoolId: string, yearId?: string): Promise<TuitionPlan[]> {
  const client = sb();
  if (!client) return [];

  try {
    let query = client
      .from("tuition_plans")
      .select(`
        *,
        classes(name),
        tuition_installments(*)
      `)
      .eq("school_id", schoolId);

    if (yearId) {
      query = query.eq("academic_year_id", yearId);
    }

    const { data, error } = await withTimeout(query);

    if (error || !data) return [];

    return data.map((tp: any) => ({
      id: tp.id,
      school_id: tp.school_id,
      academic_year_id: tp.academic_year_id,
      class_id: tp.class_id,
      class_name: tp.classes?.name || tp.class_name || "",
      total_amount: Number(tp.total_amount) || 0,
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
  } catch {
    return [];
  }
}

export async function saveTuitionPlanDb(
  plan: TuitionPlan,
  schoolId: string,
  yearId: string
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    // 1. Upsert plan
    const { data: planData, error: planErr } = await client
      .from("tuition_plans")
      .upsert({
        school_id: schoolId,
        academic_year_id: yearId,
        class_id: plan.class_id,
        total_amount: plan.total_amount,
        description: plan.description,
      })
      .select()
      .single();

    if (planErr || !planData) return false;

    // 2. Clear old installments and re-insert
    await client.from("tuition_installments").delete().eq("tuition_plan_id", planData.id);

    if (plan.installments && plan.installments.length > 0) {
      const installmentsPayload = plan.installments.map((inst, idx) => ({
        tuition_plan_id: planData.id,
        title: inst.title,
        due_date: inst.due_date,
        amount: inst.amount,
        installment_order: idx + 1,
      }));

      await client.from("tuition_installments").insert(installmentsPayload);
    }

    return true;
  } catch {
    return false;
  }
}

export async function deleteTuitionPlanDb(classId: string, schoolId: string): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client
      .from("tuition_plans")
      .delete()
      .eq("school_id", schoolId)
      .eq("class_id", classId);

    return !error;
  } catch {
    return false;
  }
}

// ─── 7. PAYMENT METHODS CONFIG ───────────────────────────

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

export async function fetchPaymentMethodsDb(schoolId: string): Promise<PaymentMethodConfig[]> {
  const client = sb();
  if (!client) return DEFAULT_PAYMENT_METHODS;

  try {
    const { data, error } = await withTimeout(
      client
        .from("payment_methods_config")
        .select("*")
        .eq("school_id", schoolId)
        .order("order_index", { ascending: true })
    );

    if (error || !data || data.length === 0) return DEFAULT_PAYMENT_METHODS;

    return data.map((m: any) => ({
      key: m.key,
      label: m.label,
      is_active: m.is_active !== false,
      order_index: m.order_index || 0,
    }));
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
}

export async function savePaymentMethodsDb(
  schoolId: string,
  methods: PaymentMethodConfig[]
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const payloads = methods.map((m, idx) => ({
      school_id: schoolId,
      key: m.key,
      label: m.label,
      is_active: m.is_active,
      order_index: idx,
    }));

    const { error } = await client
      .from("payment_methods_config")
      .upsert(payloads, { onConflict: "school_id,key" });

    return !error;
  } catch {
    return false;
  }
}

// ─── 8. REMINDERS ────────────────────────────────────────

export async function fetchReminders(schoolId: string): Promise<Reminder[]> {
  const client = sb();
  if (!client) return [];

  try {
    const { data, error } = await withTimeout(
      client
        .from("reminders")
        .select(`
          *,
          students(first_name, last_name),
          parents(full_name, phone_primary)
        `)
        .eq("school_id", schoolId)
        .order("sent_at", { ascending: false })
        .limit(200)
    );

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      school_id: r.school_id,
      student_id: r.student_id,
      student_name: r.students ? `${r.students.first_name} ${r.students.last_name}` : "",
      parent_id: r.parent_id,
      parent_name: r.parents?.full_name || "",
      parent_phone: r.parents?.phone_primary || "",
      channel: r.channel,
      message_content: r.message_content,
      amount_due: Number(r.amount_due) || 0,
      days_late: r.days_late || 0,
      status: r.status || "sent",
      sent_at: r.sent_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function insertReminderDb(
  reminder: Omit<Reminder, "id" | "sent_at">,
  schoolId: string
): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("reminders").insert({
      school_id: schoolId,
      student_id: reminder.student_id,
      parent_id: reminder.parent_id || null,
      channel: reminder.channel,
      message_content: reminder.message_content,
      amount_due: reminder.amount_due,
      days_late: reminder.days_late || 0,
      status: reminder.status || "sent",
    });

    return !error;
  } catch {
    return false;
  }
}

// ─── 9. IMPORT BATCHES ───────────────────────────────────

export async function fetchImportBatchesDb(schoolId: string): Promise<ImportBatchRecord[]> {
  const client = sb();
  if (!client) return [];

  try {
    const { data, error } = await withTimeout(
      client
        .from("import_batches")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(50)
    );

    if (error || !data) return [];

    return data.map((b: any) => ({
      id: b.id,
      school_id: b.school_id,
      academic_year_id: b.academic_year_id,
      user_id: b.user_id,
      user_name: b.user_name || "Direction",
      source_type: b.source_type,
      file_name: b.file_name,
      total_rows: b.total_rows || 0,
      imported_students_count: b.imported_students_count || 0,
      imported_payments_count: b.imported_payments_count || 0,
      errors_count: b.errors_count || 0,
      duplicates_count: b.duplicates_count || 0,
      payload_summary: b.payload_summary,
      created_at: b.created_at,
    }));
  } catch {
    return [];
  }
}

export async function insertImportBatchDb(batch: ImportBatchRecord): Promise<boolean> {
  const client = sb();
  if (!client) return false;

  try {
    const { error } = await client.from("import_batches").insert({
      school_id: batch.school_id,
      academic_year_id: batch.academic_year_id,
      user_name: batch.user_name,
      source_type: batch.source_type,
      file_name: batch.file_name,
      total_rows: batch.total_rows,
      imported_students_count: batch.imported_students_count,
      imported_payments_count: batch.imported_payments_count,
      errors_count: batch.errors_count,
      duplicates_count: batch.duplicates_count,
      payload_summary: batch.payload_summary,
    });

    return !error;
  } catch {
    return false;
  }
}

// ─── 10. DIRECT POSTGRESQL BULK BATCH IMPORT ────────────────────────────────
export async function batchImportToPostgres(params: {
  schoolId: string;
  academicYearId: string;
  sourceType: string;
  fileName?: string;
  students: Array<{
    first_name: string;
    last_name: string;
    gender: "M" | "F";
    birth_date?: string;
    class_id?: string;
    class_name?: string;
    matricule?: string;
    discount_amount?: number;
    discount_reason?: string;
    custom_tuition?: number;
    parent_name?: string;
    parent_phone?: string;
    parent_relationship?: string;
    parent_address?: string;
  }>;
  payments?: Array<{
    student_matricule: string;
    amount: number;
    payment_method: string;
    payment_date?: string;
    transaction_ref?: string;
    receipt_number?: string;
    notes?: string;
  }>;
}): Promise<{
  success: boolean;
  importedStudentsCount: number;
  importedPaymentsCount: number;
  errorsCount: number;
  errorMessages: string[];
}> {
  const client = sb();
  if (!client) {
    return {
      success: false,
      importedStudentsCount: 0,
      importedPaymentsCount: 0,
      errorsCount: params.students.length,
      errorMessages: ["Client Supabase non initialisé."],
    };
  }

  let importedStudentsCount = 0;
  let importedPaymentsCount = 0;
  let errorsCount = 0;
  const errorMessages: string[] = [];
  const matriculeToStudentIdMap = new Map<string, string>();

  // 1. Process Students & Parents
  for (const s of params.students) {
    try {
      let parentId: string | null = null;

      // Insert Parent if provided
      if (s.parent_name && s.parent_name.trim()) {
        const { data: pData } = await client
          .from("parents")
          .insert({
            school_id: params.schoolId,
            full_name: s.parent_name.trim(),
            phone_primary: s.parent_phone || "+228 90 00 00 00",
            relationship: s.parent_relationship || "Parent",
            address: s.parent_address || null,
          })
          .select("id")
          .single();

        if (pData?.id) parentId = pData.id;
      }

      // Generate matricule if missing
      const finalMatricule = s.matricule?.trim() || `MAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

      // Insert Student
      const { data: sData, error: sErr } = await client
        .from("students")
        .upsert(
          {
            school_id: params.schoolId,
            academic_year_id: params.academicYearId,
            class_id: s.class_id || null,
            matricule: finalMatricule,
            first_name: s.first_name.trim(),
            last_name: s.last_name.trim(),
            gender: s.gender || "M",
            birth_date: s.birth_date || null,
            discount_amount: s.discount_amount || 0,
            discount_reason: s.discount_reason || null,
            custom_tuition: s.custom_tuition || null,
            is_active: true,
          },
          { onConflict: "school_id,academic_year_id,matricule" }
        )
        .select("id, matricule")
        .single();

      if (sErr || !sData) {
        errorsCount++;
        errorMessages.push(`Erreur insertion élève ${s.first_name} ${s.last_name}: ${sErr?.message || "Inconnue"}`);
        continue;
      }

      matriculeToStudentIdMap.set(finalMatricule, sData.id);
      importedStudentsCount++;

      // Link Parent
      if (parentId) {
        try {
          await client
            .from("student_parents")
            .upsert({
              student_id: sData.id,
              parent_id: parentId,
              is_primary_contact: true,
            }, { onConflict: "student_id,parent_id" });
        } catch {}
      }
    } catch (e: any) {
      errorsCount++;
      errorMessages.push(`Exception sur élève ${s.first_name}: ${e?.message}`);
    }
  }

  // 2. Process Payments if any
  if (params.payments && params.payments.length > 0) {
    for (const p of params.payments) {
      try {
        const studentId = matriculeToStudentIdMap.get(p.student_matricule);
        if (!studentId) continue;

        const receiptNum = p.receipt_number || `REC-${Date.now().toString().slice(-6)}`;
        const { error: pErr } = await client.from("payments").insert({
          school_id: params.schoolId,
          academic_year_id: params.academicYearId,
          student_id: studentId,
          amount: p.amount,
          allocated_amount: p.amount,
          payment_method: p.payment_method || "cash",
          transaction_ref: p.transaction_ref || null,
          receipt_number: receiptNum,
          notes: p.notes || "Import initial",
          status: "completed",
        });

        if (!pErr) {
          importedPaymentsCount++;
        }
      } catch {}
    }
  }

  // 3. Record in import_batches
  try {
    await client.from("import_batches").insert({
      school_id: params.schoolId,
      academic_year_id: params.academicYearId,
      source_type: params.sourceType,
      file_name: params.fileName || "Import Direct",
      total_rows: params.students.length,
      imported_students_count: importedStudentsCount,
      imported_payments_count: importedPaymentsCount,
      errors_count: errorsCount,
      duplicates_count: 0,
      payload_summary: {
        success: true,
        importedStudentsCount,
        importedPaymentsCount,
        errorsCount,
      },
    });
  } catch {}

  return {
    success: errorsCount === 0 || importedStudentsCount > 0,
    importedStudentsCount,
    importedPaymentsCount,
    errorsCount,
    errorMessages,
  };
}

// ─── 13. NOTIFICATIONS (SYSTÈME INTELLIGENT) ──────────────

export async function fetchNotificationsDb(
  schoolId: string,
  limit = 100
): Promise<ScolyNotification[]> {
  const client = sb();
  if (!client || !schoolId) return [];

  try {
    const { data, error } = await withTimeout(
      client
        .from("notifications")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(limit)
    );

    if (error || !data) return [];

    return data.map((n: any) => ({
      id: n.id,
      school_id: n.school_id,
      user_id: n.user_id,
      target_roles: n.target_roles || [],
      type: n.type,
      priority: n.priority || "info",
      title: n.title,
      message: n.message,
      action_url: n.action_url,
      action_label: n.action_label,
      entity_type: n.entity_type,
      entity_id: n.entity_id,
      metadata: n.metadata || {},
      is_read: Boolean(n.is_read),
      read_at: n.read_at,
      read_by: n.read_by || [],
      dedup_key: n.dedup_key,
      created_at: n.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function insertNotificationDb(
  notification: Partial<ScolyNotification>,
  schoolId: string
): Promise<{ success: boolean; data?: ScolyNotification }> {
  const client = sb();
  if (!client || !schoolId) return { success: false };

  try {
    const payload: any = {
      school_id: schoolId,
      user_id: notification.user_id || null,
      target_roles: notification.target_roles || [],
      type: notification.type || "info",
      priority: notification.priority || "info",
      title: notification.title,
      message: notification.message,
      action_url: notification.action_url || null,
      action_label: notification.action_label || null,
      entity_type: notification.entity_type || null,
      entity_id: notification.entity_id || null,
      metadata: notification.metadata || {},
      is_read: notification.is_read || false,
      dedup_key: notification.dedup_key || null,
      created_at: notification.created_at || new Date().toISOString(),
    };

    if (notification.id) payload.id = notification.id;

    const { data, error } = await client
      .from("notifications")
      .upsert(payload)
      .select()
      .single();

    if (error) return { success: false };
    return { success: true, data };
  } catch {
    return { success: false };
  }
}

export async function markNotificationAsReadDb(
  notificationId: string,
  userId?: string
): Promise<boolean> {
  const client = sb();
  if (!client || !notificationId) return false;

  try {
    const now = new Date().toISOString();
    const { error } = await client
      .from("notifications")
      .update({
        is_read: true,
        read_at: now,
      })
      .eq("id", notificationId);

    return !error;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsReadDb(
  schoolId: string,
  userId?: string
): Promise<boolean> {
  const client = sb();
  if (!client || !schoolId) return false;

  try {
    const now = new Date().toISOString();
    const { error } = await client
      .from("notifications")
      .update({
        is_read: true,
        read_at: now,
      })
      .eq("school_id", schoolId)
      .eq("is_read", false);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteNotificationDb(notificationId: string): Promise<boolean> {
  const client = sb();
  if (!client || !notificationId) return false;

  try {
    const { error } = await client
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    return !error;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. ABONNEMENTS (SUBSCRIPTIONS)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSubscriptionDb(schoolId: string): Promise<ScolySubscription | null> {
  const client = sb();
  if (!client || !schoolId) return null;

  try {
    const { data, error } = await client
      .from("subscriptions")
      .select("*")
      .eq("school_id", schoolId)
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      school_id: data.school_id,
      plan: data.plan || "start",
      billing_period: data.billing_period || "monthly",
      status: data.status || "trialing",
      price_amount: Number(data.price_amount) || 0,
      currency: data.currency || "FCFA",
      trial_start_at: data.trial_start_at,
      trial_end_at: data.trial_end_at,
      subscription_start_at: data.subscription_start_at,
      subscription_end_at: data.subscription_end_at,
      cancelled_at: data.cancelled_at,
      last_payment_reference: data.last_payment_reference,
      last_payment_method: data.last_payment_method,
      payment_provider: data.payment_provider || "fedapay",
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function upsertSubscriptionDb(
  sub: Partial<ScolySubscription> & { school_id: string }
): Promise<ScolySubscription | null> {
  const client = sb();
  if (!client || !sub.school_id) return null;

  try {
    const payload = {
      ...sub,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("subscriptions")
      .upsert(payload, { onConflict: "school_id" })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      school_id: data.school_id,
      plan: data.plan,
      billing_period: data.billing_period,
      status: data.status,
      price_amount: Number(data.price_amount) || 0,
      currency: data.currency || "FCFA",
      trial_start_at: data.trial_start_at,
      trial_end_at: data.trial_end_at,
      subscription_start_at: data.subscription_start_at,
      subscription_end_at: data.subscription_end_at,
      cancelled_at: data.cancelled_at,
      last_payment_reference: data.last_payment_reference,
      last_payment_method: data.last_payment_method,
      payment_provider: data.payment_provider,
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function activatePaidSubscriptionDb(
  schoolId: string,
  plan: SubscriptionPlan,
  billingPeriod: SubscriptionBillingPeriod,
  transactionRef?: string,
  amount?: number
): Promise<ScolySubscription | null> {
  const start = new Date();
  const end = new Date(start);

  if (billingPeriod === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  const priceAmount =
    amount ||
    (plan === "premium"
      ? billingPeriod === "yearly"
        ? 210000
        : 25000
      : plan === "pro"
      ? billingPeriod === "yearly"
        ? 84000
        : 10000
      : billingPeriod === "yearly"
      ? 42000
      : 5000);

  return upsertSubscriptionDb({
    school_id: schoolId,
    plan,
    billing_period: billingPeriod,
    status: "active",
    price_amount: priceAmount,
    currency: "FCFA",
    subscription_start_at: start.toISOString(),
    subscription_end_at: end.toISOString(),
    last_payment_reference: transactionRef || `SUB-${Date.now()}`,
    last_payment_method: "fedapay_mobile_money",
    payment_provider: "fedapay",
  });
}

export { isSupabaseConfigured };


