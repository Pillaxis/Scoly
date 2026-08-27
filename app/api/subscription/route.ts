import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getDefaultTrialSubscription } from "@/lib/subscription/features";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("school_id");

  if (!schoolId) {
    return NextResponse.json({ error: "school_id requis" }, { status: 400 });
  }

  try {
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("school_id", schoolId)
      .limit(1)
      .single();

    if (error || !sub) {
      const defaultSub = getDefaultTrialSubscription(schoolId);
      try {
        await supabase.from("subscriptions").upsert(defaultSub, { onConflict: "school_id" });
      } catch (upsertErr) {
        console.warn("Could not upsert default trial subscription:", upsertErr);
      }
      return NextResponse.json({ success: true, subscription: defaultSub });
    }


    return NextResponse.json({ success: true, subscription: sub });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { school_id, plan, billing_period, status, metadata } = body;

    if (!school_id) {
      return NextResponse.json({ error: "school_id requis" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      school_id,
      updated_at: new Date().toISOString(),
    };

    if (plan) updates.plan = plan;
    if (billing_period) updates.billing_period = billing_period;
    if (status) updates.status = status;
    if (metadata) updates.metadata = metadata;

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(updates, { onConflict: "school_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
