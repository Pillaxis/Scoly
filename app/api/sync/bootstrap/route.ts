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

    const sanitizedEmail = email ? email.replace(/[^a-zA-Z0-9_-]/g, "_") : null;

    // ─── 1. CHECK SUPABASE STORAGE FOR MULTI-DEVICE DATA ─────────────────────────
    const storagePathsToTry: string[] = [];
    if (user_id) storagePathsToTry.push(`schools/user_${user_id}/data.json`);
    if (sanitizedEmail) storagePathsToTry.push(`schools/email_${sanitizedEmail}/data.json`);
    if (school_id) storagePathsToTry.push(`schools/${school_id}/data.json`);

    for (const path of storagePathsToTry) {
      try {
        const { data: fileData, error } = await supabase.storage
          .from("scoly-data")
          .download(path);

        if (fileData && !error) {
          const text = await fileData.text();
          const parsed = JSON.parse(text);
          if (parsed && parsed.school) {
            return NextResponse.json({
              success: true,
              source: "cloud_storage",
              school: parsed.school,
              academicYear: parsed.academicYear,
              classes: parsed.classes || [],
              students: parsed.students || [],
              payments: parsed.payments || [],
              tuitionPlans: parsed.tuitionPlans || [],
              paymentMethods: parsed.paymentMethods || [],
              reminders: parsed.reminders || [],
              staffMembers: parsed.staffMembers || [],
              importBatches: parsed.importBatches || [],
              auditLogs: parsed.auditLogs || [],
            });
          }
        }
      } catch (storageErr) {
        console.debug("Storage check error for", path, storageErr);
      }
    }

    // If no exact match, inspect storage bucket to find any available school file
    try {
      const { data: files } = await supabase.storage.from("scoly-data").list("schools");
      if (files && files.length > 0) {
        // Sort by most recently updated
        const candidate = files.find((f) => f.name.endsWith(".json")) || files[0];
        if (candidate) {
          const candidatePath = candidate.name.endsWith(".json")
            ? `schools/${candidate.name}`
            : `schools/${candidate.name}/data.json`;

          const { data: fileData } = await supabase.storage
            .from("scoly-data")
            .download(candidatePath);

          if (fileData) {
            const text = await fileData.text();
            const parsed = JSON.parse(text);
            if (parsed && parsed.school) {
              return NextResponse.json({
                success: true,
                source: "cloud_storage_fallback",
                school: parsed.school,
                academicYear: parsed.academicYear,
                classes: parsed.classes || [],
                students: parsed.students || [],
                payments: parsed.payments || [],
                tuitionPlans: parsed.tuitionPlans || [],
                paymentMethods: parsed.paymentMethods || [],
                reminders: parsed.reminders || [],
                staffMembers: parsed.staffMembers || [],
                importBatches: parsed.importBatches || [],
                auditLogs: parsed.auditLogs || [],
              });
            }
          }
        }
      }
    } catch {}

    // ─── 2. CHECK POSTGRESQL TABLES FALLBACK ─────────────────────────────────────
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
      const [schoolRes, yearRes, classesRes, studentsRes, paymentsRes, tuitionRes, methodsRes] =
        await Promise.allSettled([
          supabase.from("schools").select("*").eq("id", targetSchoolId).single(),
          supabase.from("academic_years").select("*").eq("school_id", targetSchoolId).eq("is_current", true).single(),
          supabase.from("classes").select("*").eq("school_id", targetSchoolId).order("order_index", { ascending: true }),
          supabase.from("students").select("*").eq("school_id", targetSchoolId),
          supabase.from("payments").select("*").eq("school_id", targetSchoolId),
          supabase.from("tuition_plans").select("*").eq("school_id", targetSchoolId),
          supabase.from("payment_methods_config").select("*").eq("school_id", targetSchoolId),
        ]);

      const schoolData = schoolRes.status === "fulfilled" ? schoolRes.value.data : null;
      if (schoolData) {
        return NextResponse.json({
          success: true,
          source: "postgres",
          school: schoolData,
          academicYear: yearRes.status === "fulfilled" ? yearRes.value.data : null,
          classes: classesRes.status === "fulfilled" && classesRes.value.data ? classesRes.value.data : [],
          students: studentsRes.status === "fulfilled" && studentsRes.value.data ? studentsRes.value.data : [],
          payments: paymentsRes.status === "fulfilled" && paymentsRes.value.data ? paymentsRes.value.data : [],
          tuitionPlans: tuitionRes.status === "fulfilled" && tuitionRes.value.data ? tuitionRes.value.data : [],
          paymentMethods: methodsRes.status === "fulfilled" && methodsRes.value.data ? methodsRes.value.data : [],
          reminders: [],
          staffMembers: [],
          importBatches: [],
          auditLogs: [],
        });
      }
    }

    // ─── 3. CLEAN FRESH DEFAULT FALLBACK ─────────────────────────────────────────
    return NextResponse.json({
      success: true,
      source: "clean_init",
      school: {
        id: school_id || "school-" + (user_id || "default"),
        name: "Mon Établissement Scolaire",
        code: "ECOLE-001",
        slug: "mon-ecole",
        phone: "+228 90 00 00 00",
        email: email || null,
        address: "Quartier Administratif",
        city: "Lomé",
        country: "Togo",
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
      },
      academicYear: {
        id: "year-default",
        school_id: school_id || "school-default",
        name: "2025-2026",
        start_date: "2025-09-15",
        end_date: "2026-06-30",
        is_current: true,
      },
      classes: [],
      students: [],
      payments: [],
      tuitionPlans: [],
      paymentMethods: [],
      reminders: [],
      staffMembers: [],
      importBatches: [],
      auditLogs: [],
    });
  } catch (err: any) {
    console.error("Bootstrap exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}
