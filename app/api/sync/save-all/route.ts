import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      school,
      academicYear,
      classes,
      students,
      payments,
      tuitionPlans,
      paymentMethods,
      reminders,
      importBatches,
      user_id,
    } = body;

    if (!school?.id) {
      return NextResponse.json({ error: "school.id requis" }, { status: 400 });
    }

    const schoolId = school.id;
    const yearId = academicYear?.id || crypto.randomUUID();

    // ─── 1. UPSERT SCHOOL (TENANT) ────────────────────────────────────────────
    const { error: schoolErr } = await supabase.from("schools").upsert({
      id: schoolId,
      name: school.name || "",
      code: school.code || "ECOLE-001",
      slug: school.slug || "mon-ecole",
      logo_url: school.logo_url || null,
      phone: school.phone || "",
      email: school.email || null,
      address: school.address || "",
      city: school.city || "",
      country: school.country || "",
      currency: school.currency || "FCFA",
      receipt_prefix: school.receipt_prefix || "",
      receipt_counter: Number(school.receipt_counter) || 0,
      education_types: school.education_types || [],
      onboarding_completed: school.onboarding_completed ?? true,
      onboarding_current_step: school.onboarding_current_step ?? 9,
      notification_preferences: school.notification_preferences || {},
      updated_at: new Date().toISOString(),
    });

    if (schoolErr) {
      console.warn("[Save-All] School upsert notice:", schoolErr.message);
    }

    // ─── 2. LINK USER AS MEMBER (RBAC) ────────────────────────────────────────
    if (user_id) {
      try {
        await supabase.from("school_members").upsert(
          {
            school_id: schoolId,
            user_id: user_id,
            role: "director",
            first_name: school.name?.split(" ")[0] || "Direction",
            last_name: "Admin",
            is_active: true,
          },
          { onConflict: "school_id,user_id" }
        );
      } catch {}
    }

    // ─── 3. UPSERT ACADEMIC YEAR ──────────────────────────────────────────────
    if (academicYear) {
      try {
        await supabase.from("academic_years").upsert({
          id: yearId,
          school_id: schoolId,
          name: academicYear.name || "2025-2026",
          start_date: academicYear.start_date || "2025-09-15",
          end_date: academicYear.end_date || "2026-06-30",
          is_current: true,
        });
      } catch {}
    }

    // ─── 4. UPSERT CLASSES ──────────────────────────────────────────────────
    const isUUID = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

    // Map old/custom IDs and class names to valid UUIDs
    const classIdMap = new Map<string, string>();
    const classNameToIdMap = new Map<string, string>();

    if (Array.isArray(classes)) {
      for (const cls of classes) {
        const validId = isUUID(cls.id) ? cls.id : crypto.randomUUID();
        classIdMap.set(cls.id, validId);
        if (cls.name) {
          classNameToIdMap.set(cls.name.toLowerCase().trim(), validId);
        }

        try {
          await supabase.from("classes").upsert({
            id: validId,
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
        } catch (err: any) {
          console.warn("[Save-All] Class upsert notice:", err?.message);
        }
      }
    }

    // ─── 5. UPSERT PAYMENT METHODS CONFIG ─────────────────────────────────────
    if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      try {
        const methodsPayload = paymentMethods.map((m: any, idx: number) => ({
          school_id: schoolId,
          key: m.key,
          label: m.label,
          is_active: m.is_active !== false,
          order_index: m.order_index ?? idx,
        }));
        await supabase
          .from("payment_methods_config")
          .upsert(methodsPayload, { onConflict: "school_id,key" });
      } catch {}
    }

    // ─── 6. UPSERT STUDENTS & PARENTS (ATOMIC PERSISTENCE) ───────────────────
    let studentsSaved = 0;
    if (Array.isArray(students) && students.length > 0) {
      for (const s of students) {
        let parentId = s.parent?.id && isUUID(s.parent.id) ? s.parent.id : crypto.randomUUID();
        const studentId = s.id && isUUID(s.id) ? s.id : crypto.randomUUID();
        
        let studentClassId = classIdMap.get(s.class_id) || (isUUID(s.class_id) ? s.class_id : null);
        if (!studentClassId && s.class_name) {
          studentClassId = classNameToIdMap.get(s.class_name.toLowerCase().trim()) || null;
        }

        // Parent name & phone extraction & sanitization
        let parentFullName = (s.parent?.full_name || "").trim();
        let parentPhone = (s.parent?.phone_primary || "").trim();
        const parentWa = (s.parent?.phone_whatsapp || "").trim() || null;

        // If parent full_name is purely digits/phone number
        const isPurePhone = (str: string) => {
          const digits = str.replace(/[^0-9+]/g, "");
          return digits.length >= 7 && (digits.length / (str.replace(/\s/g, "").length || 1)) >= 0.7;
        };

        if (parentFullName && isPurePhone(parentFullName)) {
          if (!parentPhone || parentPhone === "—") {
            parentPhone = parentFullName;
          }
          parentFullName = `Parent de ${s.last_name || "l'élève"}`;
        }

        if (!parentFullName) {
          parentFullName = `Parent de ${s.last_name || "l'élève"}`;
        }

        if (parentPhone === "—" || !parentPhone) {
          parentPhone = "+228 90 00 00 00"; // Valid fallback for DB constraint if required
        }

        // Insert / Update Parent
        try {
          const { data: pData } = await supabase
            .from("parents")
            .upsert({
              id: parentId,
              school_id: schoolId,
              full_name: parentFullName,
              relationship: s.parent?.relationship || "Parent",
              phone_primary: parentPhone,
              phone_whatsapp: parentWa,
              email: s.parent?.email || null,
              profession: s.parent?.profession || null,
              address: s.parent?.address || null,
            })
            .select("id")
            .single();

          if (pData?.id) parentId = pData.id;
        } catch (pErr) {
          console.warn("[Save-All] Parent upsert notice:", pErr);
        }

        // Insert / Update Student
        try {
          const { data: sData, error: sErr } = await supabase.from("students").upsert({
            id: studentId,
            school_id: schoolId,
            academic_year_id: yearId,
            class_id: studentClassId,
            matricule: s.matricule || `MAT-${studentId.slice(0, 6)}`,
            first_name: s.first_name,
            last_name: s.last_name,
            gender: s.gender || "M",
            birth_date: s.birth_date || null,
            is_active: s.is_active !== false,
            discount_amount: s.discount_amount || 0,
            discount_reason: s.discount_reason || null,
            custom_tuition: s.custom_tuition || null,
            updated_at: new Date().toISOString(),
          }).select("id").single();

          if (!sErr && sData) {
            studentsSaved++;
            if (parentId) {
              await supabase.from("student_parents").upsert({
                student_id: sData.id,
                parent_id: parentId,
                is_primary_contact: true,
              }, { onConflict: "student_id,parent_id" });
            }
          } else if (sErr) {
            console.warn("[Save-All] Student upsert error:", sErr.message);
          }
        } catch (sEx) {
          console.warn("[Save-All] Student exception:", sEx);
        }
      }
    }

    // ─── 7. UPSERT PAYMENTS ───────────────────────────────────────────────────
    let paymentsSaved = 0;
    if (Array.isArray(payments) && payments.length > 0) {
      for (const p of payments) {
        const paymentId = p.id && isUUID(p.id) ? p.id : crypto.randomUUID();
        const paymentStudentId = isUUID(p.student_id) ? p.student_id : null;
        if (!paymentStudentId) continue;

        try {
          const { error: pErr } = await supabase.from("payments").upsert({
            id: paymentId,
            school_id: schoolId,
            academic_year_id: yearId,
            student_id: paymentStudentId,
            amount: p.amount,
            allocated_amount: p.allocated_amount || p.amount,
            credit_amount: p.credit_amount || 0,
            is_advance: p.is_advance || false,
            payment_method: p.payment_method || "cash",
            transaction_ref: p.transaction_ref || null,
            receipt_number: p.receipt_number || "REC-25-00001",
            notes: p.notes || null,
            status: p.status || "completed",
            cancelled_at: p.cancelled_at || null,
            cancellation_reason: p.cancellation_reason || null,
            idempotency_key: p.idempotency_key || null,
          });

          if (!pErr) paymentsSaved++;
        } catch {}
      }
    }

    // ─── 8. UPSERT TUITION PLANS ──────────────────────────────────────────────
    if (Array.isArray(tuitionPlans) && tuitionPlans.length > 0) {
      for (const tp of tuitionPlans) {
        const targetClassId = classIdMap.get(tp.class_id) || (isUUID(tp.class_id) ? tp.class_id : null);
        if (!targetClassId && tp.class_id !== "all") continue;

        // If 'all', create a plan for every active class
        const targetClasses = targetClassId
          ? [targetClassId]
          : Array.from(classIdMap.values());

        for (const clsUuid of targetClasses) {
          try {
            const planId = isUUID(tp.id) ? tp.id : crypto.randomUUID();
            const { data: planData, error: planErr } = await supabase
              .from("tuition_plans")
              .upsert(
                {
                  id: planId,
                  school_id: schoolId,
                  academic_year_id: yearId,
                  class_id: clsUuid,
                  total_amount: Number(tp.total_amount) || 0,
                  description: tp.description || null,
                },
                { onConflict: "school_id,academic_year_id,class_id" }
              )
              .select("id")
              .single();

            const actualPlanId = planData?.id || planId;

            if (actualPlanId && Array.isArray(tp.installments) && tp.installments.length > 0) {
              await supabase.from("tuition_installments").delete().eq("tuition_plan_id", actualPlanId);
              const installmentsPayload = tp.installments.map((inst: any, idx: number) => ({
                id: isUUID(inst.id) ? inst.id : crypto.randomUUID(),
                tuition_plan_id: actualPlanId,
                title: inst.title || `Tranche ${idx + 1}`,
                due_date: inst.due_date || "2025-10-05",
                amount: Number(inst.amount) || 0,
                installment_order: inst.installment_order || idx + 1,
              }));
              await supabase.from("tuition_installments").insert(installmentsPayload);
            }
          } catch (tpErr: any) {
            console.warn("[Save-All] Tuition plan notice:", tpErr?.message);
          }
        }
      }
    }

    // ─── 9. UPSERT NOTIFICATIONS ─────────────────────────────────────────────
    const notifications = body.notifications;
    if (Array.isArray(notifications) && notifications.length > 0) {
      for (const n of notifications) {
        try {
          await supabase.from("notifications").upsert({
            id: n.id,
            school_id: schoolId,
            user_id: n.user_id || null,
            target_roles: n.target_roles || [],
            type: n.type,
            priority: n.priority || "info",
            title: n.title,
            message: n.message,
            action_url: n.action_url || null,
            action_label: n.action_label || null,
            entity_type: n.entity_type || null,
            entity_id: n.entity_id || null,
            metadata: n.metadata || {},
            is_read: Boolean(n.is_read),
            read_at: n.read_at || null,
            dedup_key: n.dedup_key || null,
            created_at: n.created_at || new Date().toISOString(),
          });
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      message: "Synchronisation PostgreSQL Supabase effectuée avec succès.",
      studentsCount: studentsSaved,
      paymentsCount: paymentsSaved,
    });

  } catch (err: any) {
    console.error("[Save-All] Exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}
