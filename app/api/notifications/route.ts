import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("school_id");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  if (!schoolId) {
    return NextResponse.json({ error: "Paramètre school_id manquant" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, error: error.message, notifications: [] });
    }

    return NextResponse.json({ success: true, notifications: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, notifications: [] });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { notification, school_id } = body;

    if (!school_id || !notification) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    const payload: any = {
      school_id,
      user_id: notification.user_id || null,
      target_roles: notification.target_roles || [],
      type: notification.type || "info",
      priority: notification.priority || "info",
      title: notification.title,
      message: notification.message,
      action_url: notification.action_url || null,
      action_label: notification.action_label || null,
      entity_type: notification.entity_type || null,
      entity_id: notification.entity_id || null,
      metadata: notification.metadata || {},
      is_read: Boolean(notification.is_read),
      dedup_key: notification.dedup_key || null,
      created_at: notification.created_at || new Date().toISOString(),
    };

    if (notification.id) payload.id = notification.id;

    const { data, error } = await supabase
      .from("notifications")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, notification_id, school_id, user_id } = body;
    const now = new Date().toISOString();

    if (action === "MARK_ALL_READ" && school_id) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now })
        .eq("school_id", school_id)
        .eq("is_read", false);

      if (error) return NextResponse.json({ success: false, error: error.message });
      return NextResponse.json({ success: true });
    }

    if (action === "MARK_READ" && notification_id) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now })
        .eq("id", notification_id);

      if (error) return NextResponse.json({ success: false, error: error.message });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) return NextResponse.json({ success: false, error: error.message });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
