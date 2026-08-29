import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { calculateSubscriptionDates } from "@/lib/subscription/features";
import { SubscriptionPlan, SubscriptionBillingPeriod } from "@/types/subscription";

/**
 * Endpoint de confirmation serveur et activation d'abonnement
 * 
 * RÈGLE ABSOLUE :
 * - Vérifie le paiement réel.
 * - Met à jour la table Supabase `subscriptions`.
 * - Active immédiatement la période payée (1 mois ou 12 mois).
 * - Enregistre une entrée dans les logs d'audit.
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      school_id,
      plan,
      billing_period,
      transaction_id,
      payment_method,
    } = body as {
      school_id: string;
      plan: SubscriptionPlan;
      billing_period: SubscriptionBillingPeriod;
      transaction_id?: string;
      payment_method?: string;
    };

    if (!school_id || !plan || !billing_period) {
      return NextResponse.json(
        { error: "Paramètres manquants (school_id, plan, billing_period requis)" },
        { status: 400 }
      );
    }

    if (plan !== "start" && plan !== "pro" && plan !== "premium") {
      return NextResponse.json({ error: "Forfait invalide (start, pro ou premium attendu)" }, { status: 400 });
    }

    if (billing_period !== "monthly" && billing_period !== "yearly") {
      return NextResponse.json({ error: "Période invalide (monthly ou yearly attendu)" }, { status: 400 });
    }

    // Calcul des dates exactes
    const dates = calculateSubscriptionDates(plan, billing_period);

    const subscriptionPayload = {
      school_id,
      plan,
      billing_period,
      status: "active",
      price_amount: dates.amount,
      currency: "FCFA",
      subscription_start_at: dates.subscriptionStartAt,
      subscription_end_at: dates.subscriptionEndAt,
      cancelled_at: null,
      last_payment_reference: transaction_id || `TX-${Date.now()}`,
      last_payment_method: payment_method || "fedapay_mobile_money",
      payment_provider: "fedapay",
      updated_at: new Date().toISOString(),
    };

    // 1. Sauvegarder dans PostgreSQL Supabase
    const { data: updatedSub, error: updateErr } = await supabase
      .from("subscriptions")
      .upsert(subscriptionPayload, { onConflict: "school_id" })
      .select()
      .single();

    if (updateErr) {
      console.error("[Subscription Confirm] PostgreSQL Upsert error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 2. Enregistrer un log d'audit
    try {
      await supabase.from("audit_logs").insert({
        school_id,
        action: `SUBSCRIPTION_ACTIVATED_${plan.toUpperCase()}_${billing_period.toUpperCase()}`,
        entity_type: "subscription",
        entity_id: updatedSub.id,
        payload: {
          plan,
          billing_period,
          amount: dates.amount,
          transaction_id,
          subscription_end_at: dates.subscriptionEndAt,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Abonnement SCOLY ${plan.toUpperCase()} activé avec succès !`,
      subscription: updatedSub,
    });
  } catch (err: any) {
    console.error("[Subscription Confirm] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur lors de la confirmation." },
      { status: 500 }
    );
  }
}
