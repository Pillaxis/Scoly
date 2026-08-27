import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServer();

  if (!supabase) {
    return NextResponse.json({
      connected: false,
      configured: false,
      error: "Variables d'environnement Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).",
    });
  }

  try {
    // Check tables
    const [schoolsRes, studentsRes, paymentsRes, classesRes, notificationsRes, subscriptionsRes, authUsersRes] = await Promise.all([
      supabase.from("schools").select("id", { count: "exact", head: true }),
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase.from("notifications").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
    ]);

    const tablesExist = !schoolsRes.error;

    return NextResponse.json({
      connected: true,
      configured: true,
      tablesExist,
      tables: {
        schools: schoolsRes.count ?? (schoolsRes.error ? "Non trouvée" : 0),
        students: studentsRes.count ?? (studentsRes.error ? "Non trouvée" : 0),
        payments: paymentsRes.count ?? (paymentsRes.error ? "Non trouvée" : 0),
        classes: classesRes.count ?? (classesRes.error ? "Non trouvée" : 0),
        notifications: notificationsRes.count ?? (notificationsRes.error ? "Non trouvée" : 0),
        subscriptions: subscriptionsRes.count ?? (subscriptionsRes.error ? "Non trouvée" : 0),
      },
      usersCount: authUsersRes.data?.users?.length ?? 0,
      schemaError: schoolsRes.error ? schoolsRes.error.message : null,
    });


  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      configured: true,
      tablesExist: false,
      error: err?.message || "Erreur de connexion à Supabase",
    });
  }
}
