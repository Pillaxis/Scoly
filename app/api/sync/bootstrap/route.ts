import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { school_id, user_id, email } = body;

    // 1. Resolve Target School ID from PostgreSQL
    let targetSchoolId = school_id;

    if (!targetSchoolId && user_id) {
      const { data: member } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .limit(1)
        .single();
      if (member?.school_id) targetSchoolId = member.school_id;
    }

    if (!targetSchoolId && email) {
      const { data: schoolByEmail } = await supabase
        .from("schools")
        .select("id")
        .ilike("email", email.trim())
        .limit(1)
        .single();
      if (schoolByEmail?.id) targetSchoolId = schoolByEmail.id;
    }

    if (!targetSchoolId) {
      const { data: firstSchool } = await supabase
        .from("schools")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
      if (firstSchool?.id) targetSchoolId = firstSchool.id;
    }

    if (targetSchoolId) {
      // 2. Query All Entities directly from Supabase PostgreSQL Tables
      const [
        schoolRes,
        yearRes,
        yearsListRes,
        classesRes,
        studentsRes,
        paymentsRes,
        tuitionRes,
        methodsRes,
        remindersRes,
        batchesRes,
        auditRes,
      ] = await Promise.allSettled([
        supabase.from("schools").select("*").eq("id", targetSchoolId).single(),
        supabase
          .from("academic_years")
          .select("*")
          .eq("school_id", targetSchoolId)
          .eq("is_current", true)
          .single(),
        supabase
          .from("academic_years")
          .select("*")
          .eq("school_id", targetSchoolId)
          .order("start_date", { ascending: false }),
        supabase
          .from("classes")
          .select("*")
          .eq("school_id", targetSchoolId)
          .order("order_index", { ascending: true }),
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
        supabase
          .from("import_batches")
          .select("*")
          .eq("school_id", targetSchoolId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("audit_logs")
          .select("*")
          .eq("school_id", targetSchoolId)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const schoolData = schoolRes.status === "fulfilled" ? schoolRes.value.data : null;

      if (schoolData) {
        // Map Students
        const rawStudents = studentsRes.status === "fulfilled" && studentsRes.value.data ? studentsRes.value.data : [];
        const students = rawStudents.map((s: any) => {
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
              school_id: parentRecord.school_id || targetSchoolId,
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

        // Map Payments
        const rawPayments = paymentsRes.status === "fulfilled" && paymentsRes.value.data ? paymentsRes.value.data : [];
        const payments = rawPayments.map((p: any) => {
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
            matricule,
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

        // Map Tuition Plans
        const rawPlans = tuitionRes.status === "fulfilled" && tuitionRes.value.data ? tuitionRes.value.data : [];
        const tuitionPlans = rawPlans.map((tp: any) => ({
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

        // Map Classes
        const classes = classesRes.status === "fulfilled" && classesRes.value.data ? classesRes.value.data : [];

        // Map Methods
        const rawMethods = methodsRes.status === "fulfilled" && methodsRes.value.data ? methodsRes.value.data : [];
        const paymentMethods = rawMethods.map((m: any) => ({
          key: m.key,
          label: m.label,
          is_active: m.is_active !== false,
          order_index: m.order_index || 0,
        }));

        // Map Reminders
        const rawReminders = remindersRes.status === "fulfilled" && remindersRes.value.data ? remindersRes.value.data : [];
        const reminders = rawReminders.map((r: any) => ({
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

        // Map Import Batches
        const importBatches = batchesRes.status === "fulfilled" && batchesRes.value.data ? batchesRes.value.data : [];
        const auditLogs = auditRes.status === "fulfilled" && auditRes.value.data ? auditRes.value.data : [];

        return NextResponse.json({
          success: true,
          source: "postgres",
          school: schoolData,
          academicYear: yearRes.status === "fulfilled" ? yearRes.value.data : null,
          academicYearsList: yearsListRes.status === "fulfilled" && yearsListRes.value.data ? yearsListRes.value.data : [],
          classes,
          students,
          payments,
          tuitionPlans,
          paymentMethods,
          reminders,
          importBatches,
          auditLogs,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: "Aucun établissement trouvé dans PostgreSQL.",
    });
  } catch (err: any) {
    console.error("[Bootstrap] Error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
