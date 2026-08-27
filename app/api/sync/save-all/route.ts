import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const { school, academicYear, classes, students, payments, tuitionPlans, paymentMethods } = await req.json();

    if (!school?.id) {
      return NextResponse.json({ error: "school.id requis" }, { status: 400 });
    }

    const schoolId = school.id;
    const yearId = academicYear?.id || "00000000-0000-0000-0000-000000000010";

    // 1. Upsert School
    const schoolPayload: any = {
      id: schoolId,
      name: school.name || "Mon Établissement Scolaire",
      code: school.code || "ECOLE-001",
      slug: school.slug || "mon-ecole",
      phone: school.phone || "+228 90 00 00 00",
      email: school.email || null,
      address: school.address || "Quartier Administratif",
      city: school.city || "Lomé",
      country: school.country || "Togo",
      currency: school.currency || "FCFA",
      receipt_prefix: school.receipt_prefix || "REC-25-",
      receipt_counter: school.receipt_counter || 0,
      updated_at: new Date().toISOString(),
    };

    if (school.logo_url !== undefined) schoolPayload.logo_url = school.logo_url;
    if (school.education_types !== undefined) schoolPayload.education_types = school.education_types;
    if (school.onboarding_completed !== undefined) schoolPayload.onboarding_completed = school.onboarding_completed;
    if (school.onboarding_current_step !== undefined) schoolPayload.onboarding_current_step = school.onboarding_current_step;
    if (school.notification_preferences !== undefined) schoolPayload.notification_preferences = school.notification_preferences;

    await supabase.from("schools").upsert(schoolPayload);

    // 2. Upsert Academic Year
    if (academicYear) {
      await supabase.from("academic_years").upsert({
        id: yearId,
        school_id: schoolId,
        name: academicYear.name || "2025-2026",
        start_date: academicYear.start_date || "2025-09-15",
        end_date: academicYear.end_date || "2026-06-30",
        is_current: true,
      });
    }

    // 3. Upsert Classes
    if (classes && classes.length > 0) {
      for (const cls of classes) {
        await supabase.from("classes").upsert({
          id: cls.id,
          school_id: schoolId,
          academic_year_id: yearId,
          name: cls.name,
          level: cls.level || "Secondaire",
          series: cls.series || null,
          cycle_year: cls.cycle_year || null,
          branch: cls.branch || null,
          is_custom: cls.is_custom || false,
          description: cls.description || null,
          order_index: cls.order_index || 0,
        });
      }
    }

    // 4. Upsert Students & Parents
    if (students && students.length > 0) {
      for (const s of students) {
        let parentId = s.parent?.id;

        // Upsert Parent
        if (s.parent && s.parent.full_name) {
          const { data: pData } = await supabase
            .from("parents")
            .upsert({
              id: parentId && !parentId.startsWith("par-") ? parentId : undefined,
              school_id: schoolId,
              full_name: s.parent.full_name,
              relationship: s.parent.relationship || "Parent",
              phone_primary: s.parent.phone_primary || "",
              phone_whatsapp: s.parent.phone_whatsapp || null,
              email: s.parent.email || null,
              profession: s.parent.profession || null,
              address: s.parent.address || null,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (pData?.id) parentId = pData.id;
        }

        // Upsert Student
        const { data: sData } = await supabase
          .from("students")
          .upsert({
            id: s.id && !s.id.startsWith("stu-") ? s.id : undefined,
            school_id: schoolId,
            academic_year_id: yearId,
            class_id: s.class_id || null,
            matricule: s.matricule,
            first_name: s.first_name,
            last_name: s.last_name,
            gender: s.gender || "M",
            birth_date: s.birth_date || null,
            is_active: s.is_active !== false,
            discount_amount: s.discount_amount || 0,
            discount_reason: s.discount_reason || null,
            custom_tuition: s.custom_tuition || null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (sData?.id && parentId) {
          await supabase.from("student_parents").upsert({
            student_id: sData.id,
            parent_id: parentId,
            is_primary_contact: true,
          });
        }
      }
    }

    // 5. Upsert Payments
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await supabase.from("payments").upsert({
          id: p.id && !p.id.startsWith("pay-") ? p.id : undefined,
          school_id: schoolId,
          academic_year_id: yearId,
          student_id: p.student_id,
          amount: p.amount,
          allocated_amount: p.allocated_amount || p.amount,
          credit_amount: p.credit_amount || 0,
          is_advance: p.is_advance || false,
          payment_date: p.payment_date || new Date().toISOString().split("T")[0],
          payment_method: p.payment_method || "cash",
          transaction_ref: p.transaction_ref || null,
          receipt_number: p.receipt_number || "REC-25-00001",
          notes: p.notes || null,
          status: p.status || "completed",
          cancelled_at: p.cancelled_at || null,
          cancellation_reason: p.cancellation_reason || null,
          idempotency_key: p.idempotency_key || null,
        });
      }
    }

    // 6. Upsert Tuition Plans
    if (tuitionPlans && tuitionPlans.length > 0) {
      for (const tp of tuitionPlans) {
        const { data: planData } = await supabase
          .from("tuition_plans")
          .upsert({
            school_id: schoolId,
            academic_year_id: yearId,
            class_id: tp.class_id,
            total_amount: tp.total_amount,
            description: tp.description || null,
          })
          .select()
          .single();

        if (planData?.id && tp.installments) {
          await supabase.from("tuition_installments").delete().eq("tuition_plan_id", planData.id);
          await supabase.from("tuition_installments").insert(
            tp.installments.map((inst: any, idx: number) => ({
              tuition_plan_id: planData.id,
              title: inst.title,
              due_date: inst.due_date,
              amount: inst.amount,
              installment_order: idx + 1,
            }))
          );
        }
      }
    }

    // 7. Upsert Payment Methods
    if (paymentMethods && paymentMethods.length > 0) {
      for (let i = 0; i < paymentMethods.length; i++) {
        const m = paymentMethods[i];
        await supabase.from("payment_methods_config").upsert(
          {
            school_id: schoolId,
            key: m.key,
            label: m.label,
            is_active: m.is_active,
            order_index: i,
          },
          { onConflict: "school_id,key" }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Toutes les données sont synchronisées avec Supabase." });
  } catch (err: any) {
    console.error("Save all exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur de synchronisation" }, { status: 500 });
  }
}
