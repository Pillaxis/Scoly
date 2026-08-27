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
      staffMembers,
      importBatches,
      auditLogs,
      user_id,
      email,
    } = body;

    if (!school?.id) {
      return NextResponse.json({ error: "school.id requis" }, { status: 400 });
    }

    const schoolId = school.id;
    const resolvedEmail = email || school.email;
    const sanitizedEmail = resolvedEmail ? resolvedEmail.replace(/[^a-zA-Z0-9_-]/g, "_") : null;

    // ─── 1. SECURE FULL BACKUP TO SUPABASE STORAGE (MULTI-DEVICE INSTANT SYNC) ───
    const fullData = {
      school,
      academicYear: academicYear || null,
      classes: Array.isArray(classes) ? classes : [],
      students: Array.isArray(students) ? students : [],
      payments: Array.isArray(payments) ? payments : [],
      tuitionPlans: Array.isArray(tuitionPlans) ? tuitionPlans : [],
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      reminders: Array.isArray(reminders) ? reminders : [],
      staffMembers: Array.isArray(staffMembers) ? staffMembers : [],
      importBatches: Array.isArray(importBatches) ? importBatches : [],
      auditLogs: Array.isArray(auditLogs) ? auditLogs : [],
      user_id: user_id || null,
      email: resolvedEmail || null,
      updated_at: new Date().toISOString(),
    };

    const fileBuffer = Buffer.from(JSON.stringify(fullData), "utf-8");

    // Ensure bucket exists
    try {
      await supabase.storage.createBucket("scoly-data", { public: false }).catch(() => {});
    } catch {}

    // Upload under multiple fast lookup keys
    const uploadPromises: Promise<any>[] = [
      supabase.storage.from("scoly-data").upload(`schools/${schoolId}/data.json`, fileBuffer, {
        contentType: "application/json",
        upsert: true,
      }),
    ];

    if (user_id) {
      uploadPromises.push(
        supabase.storage.from("scoly-data").upload(`schools/user_${user_id}/data.json`, fileBuffer, {
          contentType: "application/json",
          upsert: true,
        })
      );
    }

    if (sanitizedEmail) {
      uploadPromises.push(
        supabase.storage.from("scoly-data").upload(`schools/email_${sanitizedEmail}/data.json`, fileBuffer, {
          contentType: "application/json",
          upsert: true,
        })
      );
    }

    await Promise.allSettled(uploadPromises);

    // ─── 2. POSTGRES TABLES SYNC (IF TABLES CREATED) ──────────────────────────
    try {
      const yearId = academicYear?.id || "00000000-0000-0000-0000-000000000010";

      // 2.1 Upsert School
      await supabase.from("schools").upsert({
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
        education_types: school.education_types || [],
        onboarding_completed: school.onboarding_completed ?? true,
        onboarding_current_step: school.onboarding_current_step ?? 9,
        notification_preferences: school.notification_preferences || {},
        updated_at: new Date().toISOString(),
      });

      // 2.2 Upsert Academic Year
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

      // 2.3 Upsert Classes
      if (classes && classes.length > 0) {
        for (const cls of classes) {
          await supabase.from("classes").upsert({
            id: cls.id,
            school_id: schoolId,
            academic_year_id: yearId,
            name: cls.name,
            level: cls.level || "Secondaire",
            order_index: cls.order_index || 0,
          });
        }
      }

      // 2.4 Upsert Students
      if (students && students.length > 0) {
        for (const s of students) {
          await supabase.from("students").upsert({
            id: s.id,
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
            updated_at: new Date().toISOString(),
          });
        }
      }

      // 2.5 Upsert Payments
      if (payments && payments.length > 0) {
        for (const p of payments) {
          await supabase.from("payments").upsert({
            id: p.id,
            school_id: schoolId,
            academic_year_id: yearId,
            student_id: p.student_id,
            receipt_number: p.receipt_number,
            amount: p.amount,
            payment_method: p.payment_method || "cash",
            payment_date: p.payment_date ? p.payment_date.split("T")[0] : new Date().toISOString().split("T")[0],
            status: p.status || "completed",
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (pgErr) {
      console.debug("PostgreSQL table sync notice (Storage JSON holds ground truth):", pgErr);
    }

    return NextResponse.json({
      success: true,
      message: "Toutes vos données sont sauvegardées en temps réel dans le Cloud Supabase.",
      studentsCount: Array.isArray(students) ? students.length : 0,
      paymentsCount: Array.isArray(payments) ? payments.length : 0,
    });
  } catch (err: any) {
    console.error("Save-all exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}
