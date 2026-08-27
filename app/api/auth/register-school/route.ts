import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const { user_id, email, full_name, first_name, last_name, school_name, phone } = await req.json();

    if (!user_id || !email) {
      return NextResponse.json({ error: "user_id et email requis" }, { status: 400 });
    }

    // Check if user is already linked to a school
    const { data: existingMember } = await supabase
      .from("school_members")
      .select("school_id")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (existingMember?.school_id) {
      return NextResponse.json({ success: true, school_id: existingMember.school_id });
    }

    const schoolId = crypto.randomUUID();
    const yearId = crypto.randomUUID();
    const finalSchoolName = school_name?.trim() || "Mon Établissement Scolaire";
    const code = "ECOLE-" + schoolId.slice(0, 6).toUpperCase();
    const slug = finalSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + schoolId.slice(0, 4);

    // 1. Create School with onboarding flag
    const { error: schoolErr } = await supabase.from("schools").insert({
      id: schoolId,
      name: finalSchoolName,
      code,
      slug,
      phone: phone || "+228 90 00 00 00",
      email,
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
    });

    if (schoolErr) {
      console.error("School creation error:", schoolErr);
      return NextResponse.json({ error: "Erreur création école: " + schoolErr.message }, { status: 500 });
    }

    // 2. Link User in school_members
    const resolvedFirstName = first_name || full_name?.split(" ")[0] || email.split("@")[0];
    const resolvedLastName = last_name || (full_name?.split(" ").slice(1).join(" ") || "Direction");

    await supabase.from("school_members").insert({
      school_id: schoolId,
      user_id,
      role: "director",
      first_name: resolvedFirstName,
      last_name: resolvedLastName,
      phone: phone || null,
      is_active: true,
    });

    // 3. Create Academic Year
    await supabase.from("academic_years").insert({
      id: yearId,
      school_id: schoolId,
      name: "2025-2026",
      start_date: "2025-09-15",
      end_date: "2026-06-30",
      is_current: true,
    });

    // 4. Create Standard Classes
    const defaultClasses = [
      { name: "CI", level: "Primaire", order_index: 1 },
      { name: "CP", level: "Primaire", order_index: 2 },
      { name: "CE1", level: "Primaire", order_index: 3 },
      { name: "CE2", level: "Primaire", order_index: 4 },
      { name: "CM1", level: "Primaire", order_index: 5 },
      { name: "CM2", level: "Primaire", order_index: 6 },
      { name: "6ème A", level: "Collège", order_index: 7 },
      { name: "5ème A", level: "Collège", order_index: 8 },
      { name: "4ème A", level: "Collège", order_index: 9 },
      { name: "3ème A", level: "Collège", order_index: 10 },
      { name: "2nde CD", level: "Lycée", order_index: 11 },
      { name: "1ère D", level: "Lycée", order_index: 12 },
      { name: "Terminale D", level: "Lycée", order_index: 13 },
    ];

    await supabase.from("classes").insert(
      defaultClasses.map((c) => ({
        school_id: schoolId,
        academic_year_id: yearId,
        name: c.name,
        level: c.level,
        order_index: c.order_index,
      }))
    );

    // 5. Create Default Payment Methods
    await supabase.from("payment_methods_config").insert([
      { school_id: schoolId, key: "cash", label: "Espèces", is_active: true, order_index: 0 },
      { school_id: schoolId, key: "tmoney", label: "TMoney", is_active: true, order_index: 1 },
      { school_id: schoolId, key: "flooz", label: "Flooz", is_active: true, order_index: 2 },
      { school_id: schoolId, key: "bank_transfer", label: "Virement bancaire", is_active: true, order_index: 3 },
      { school_id: schoolId, key: "cheque", label: "Chèque", is_active: true, order_index: 4 },
      { school_id: schoolId, key: "other", label: "Autre", is_active: true, order_index: 5 },
    ]);

    return NextResponse.json({
      success: true,
      school_id: schoolId,
      academic_year_id: yearId,
    });
  } catch (err: any) {
    console.error("Register school exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur serveur" }, { status: 500 });
  }
}
