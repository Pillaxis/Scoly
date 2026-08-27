import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { school_id, user_id } = body;

    // 1. Determine target school ID
    let targetSchoolId = school_id;

    if (!targetSchoolId && user_id) {
      // Find school linked to this user
      const { data: member } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .limit(1)
        .single();
      if (member?.school_id) {
        targetSchoolId = member.school_id;
      }
    }

    if (!targetSchoolId) {
      // Get first school available in database
      const { data: firstSchool } = await supabase
        .from("schools")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
      if (firstSchool?.id) {
        targetSchoolId = firstSchool.id;
      }
    }

    if (!targetSchoolId) {
      return NextResponse.json({ error: "Aucun établissement trouvé dans la base" }, { status: 404 });
    }

    // 2. Fetch School and Current Year
    const [schoolRes, yearRes] = await Promise.all([
      supabase.from("schools").select("*").eq("id", targetSchoolId).single(),
      supabase.from("academic_years").select("*").eq("school_id", targetSchoolId).eq("is_current", true).single(),
    ]);

    if (!schoolRes.data) {
      return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 });
    }

    const school = schoolRes.data;
    const yearId = yearRes.data?.id;

    // 3. Parallel fetch all school entities
    const [classesRes, studentsRes, paymentsRes, tuitionRes, methodsRes, remindersRes] = await Promise.all([
      supabase.from("classes").select("*").eq("school_id", targetSchoolId).order("order_index", { ascending: true }),
      supabase
        .from("students")
        .select(`
          *,
          student_parents(
            is_primary_contact,
            parent:parents(*)
          ),
          classes(name)
        `)
        .eq("school_id", targetSchoolId)
        .order("created_at", { ascending: false }),
      supabase
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
        .eq("school_id", targetSchoolId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tuition_plans")
        .select(`
          *,
          classes(name),
          tuition_installments(*)
        `)
        .eq("school_id", targetSchoolId),
      supabase
        .from("payment_methods_config")
        .select("*")
        .eq("school_id", targetSchoolId)
        .order("order_index", { ascending: true }),
      supabase
        .from("reminders")
        .select(`
          *,
          students(first_name, last_name),
          parents(full_name, phone_primary)
        `)
        .eq("school_id", targetSchoolId)
        .order("sent_at", { ascending: false })
        .limit(200),
    ]);

    // Format students
    const students = (studentsRes.data || []).map((s: any) => {
      const parentRecord = s.student_parents?.[0]?.parent || {};
      return {
        id: s.id,
        school_id: s.school_id,
        academic_year_id: s.academic_year_id,
        class_id: s.class_id || "",
        class_name: s.classes?.name || s.class_name || "",
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
          school_id: parentRecord.school_id || targetSchoolId,
          full_name: parentRecord.full_name || "",
          relationship: parentRecord.relationship || "Parent",
          phone_primary: parentRecord.phone_primary || "",
          phone_whatsapp: parentRecord.phone_whatsapp,
          email: parentRecord.email,
          profession: parentRecord.profession,
          address: parentRecord.address,
        },
        created_at: s.created_at,
      };
    });

    // Format payments
    const payments = (paymentsRes.data || []).map((p: any) => {
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
        payment_date: p.payment_date,
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
        created_at: p.created_at,
      };
    });

    // Format tuition plans
    const tuitionPlans = (tuitionRes.data || []).map((tp: any) => ({
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

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        code: school.code,
        slug: school.slug,
        logo_url: school.logo_url || undefined,
        phone: school.phone,
        email: school.email,
        address: school.address,
        city: school.city,
        country: school.country,
        currency: school.currency,
        receipt_prefix: school.receipt_prefix,
        receipt_counter: school.receipt_counter,
        education_types: school.education_types || [],
        onboarding_completed: school.onboarding_completed ?? false,
        onboarding_current_step: school.onboarding_current_step ?? 1,
        notification_preferences: school.notification_preferences || {
          unpaid_alerts: true,
          upcoming_deadlines: true,
          payment_received: true,
          reminders_due: true,
        },
      },
      academicYear: yearRes.data || {
        id: "00000000-0000-0000-0000-000000000010",
        school_id: targetSchoolId,
        name: "2025-2026",
        start_date: "2025-09-15",
        end_date: "2026-06-30",
        is_current: true,
      },
      classes: classesRes.data || [],
      students,
      payments,
      tuitionPlans,
      paymentMethods: methodsRes.data || [],
      reminders: (remindersRes.data || []).map((r: any) => ({
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
        sent_at: r.sent_at,
      })),
    });
  } catch (err: any) {
    console.error("[Bootstrap] Error:", err);
    return NextResponse.json({ error: err?.message || "Erreur lors du chargement des données" }, { status: 500 });
  }
}
