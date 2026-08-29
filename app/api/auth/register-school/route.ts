import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré sur le serveur (SUPABASE_SERVICE_ROLE_KEY manquante)." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      email,
      password,
      full_name,
      first_name,
      last_name,
      school_name,
      phone,
    } = body;

    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: "L'adresse email est requise." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 6 caractères." }, { status: 400 });
    }

    const resolvedFirstName = first_name?.trim() || full_name?.split(" ")[0]?.trim() || cleanEmail.split("@")[0];
    const resolvedLastName = last_name?.trim() || (full_name?.split(" ").slice(1).join(" ")?.trim() || "");
    const resolvedFullName = full_name?.trim() || `${resolvedFirstName} ${resolvedLastName}`.trim();
    const finalSchoolName = school_name?.trim() || `Établissement de ${resolvedFirstName}`;

    // 1. Création de l'utilisateur réel dans Supabase Auth avec confirmation automatique
    let user_id: string;

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: resolvedFullName,
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        phone: phone ? phone.trim() : null,
        school_name: finalSchoolName,
      },
    });

    if (createErr) {
      const msg = (createErr.message || "").toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("user_already_exists") ||
        (createErr as any).code === "user_already_exists"
      ) {
        return NextResponse.json(
          { error: "Un compte avec cette adresse email existe déjà. Veuillez vous connecter." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Erreur lors de la création du compte : ${createErr.message}` },
        { status: 400 }
      );
    }

    if (!newUser?.user?.id) {
      return NextResponse.json(
        { error: "La création de l'utilisateur dans Supabase Auth a échoué." },
        { status: 500 }
      );
    }

    user_id = newUser.user.id;

    // 2. Vérification de l'établissement créé (le trigger PostgreSQL handle_new_user peut l'avoir déjà créé)
    let schoolId: string | null = null;
    let yearId: string | null = null;

    try {
      const { data: existingMember } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .limit(1)
        .single();

      if (existingMember?.school_id) {
        schoolId = existingMember.school_id;
      }
    } catch {
      // Ignorer si la table n'a pas encore répondu
    }

    // 3. Si non créé automatiquement par le trigger, créer l'établissement de façon idempotente
    if (!schoolId) {
      schoolId = crypto.randomUUID();
      yearId = crypto.randomUUID();
      const code = "ECOLE-" + schoolId.slice(0, 6).toUpperCase();
      const slug = finalSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + schoolId.slice(0, 4);

      // Création de l'école
      await supabase.from("schools").insert({
        id: schoolId,
        name: finalSchoolName,
        code,
        slug,
        phone: phone ? phone.trim() : "+228 90 00 00 00",
        email: cleanEmail,
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

      // Liaison du directeur
      await supabase.from("school_members").insert({
        school_id: schoolId,
        user_id: user_id,
        role: "director",
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        phone: phone ? phone.trim() : null,
        is_active: true,
      });

      // Création de l'année scolaire
      await supabase.from("academic_years").insert({
        id: yearId,
        school_id: schoolId,
        name: "2025-2026",
        start_date: "2025-09-15",
        end_date: "2026-06-30",
        is_current: true,
      });
    }

    // 4. Garantir que l'abonnement Essai 30 jours existe pour cette école
    if (schoolId) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("school_id", schoolId)
        .limit(1)
        .single();

      if (!existingSub) {
        await supabase.from("subscriptions").insert({
          school_id: schoolId,
          plan: "start",
          billing_period: "monthly",
          status: "trialing",
          price_amount: 0,
          currency: "FCFA",
          trial_start_at: now.toISOString(),
          trial_end_at: trialEnd.toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      user_id,
      email: cleanEmail,
      school_id: schoolId,
      academic_year_id: yearId,
    });
  } catch (err: any) {
    console.error("Register school exception:", err);
    return NextResponse.json({ error: err?.message || "Erreur interne du serveur lors de l'inscription." }, { status: 500 });
  }
}
